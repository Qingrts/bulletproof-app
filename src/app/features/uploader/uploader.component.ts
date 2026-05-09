// uploader.component.ts
import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzProgressModule } from "ng-zorro-antd/progress";
import { NzMessageService } from "ng-zorro-antd/message";

interface FileItem {
  id: string;
  name: string;
  size: number;
  hash: string;
  progress: number;
  status: 'pending' | 'calculating' | 'completed' | 'error';
  errorMsg?: string;
  worker?: Worker; // 存储 Worker 引用以便取消
}
// 线程数
// navigator.hardwareConcurrency

@Component({
  selector: 'app-uploader',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzProgressModule],
  template: `
    <div style="padding: 20px;">
      <h2>文件哈希计算器 (SparkMD5)</h2>
      
      <div style="margin-bottom: 16px;">
        <input 
          type="file" 
          (change)="onFileSelected($event)" 
          multiple
          #fileInput
          [disabled]="hasCalculatingTask">
        <span style="margin-left: 8px; color: #999;">支持多文件选择，每个文件使用独立 Worker 计算</span>
      </div>
      
      <nz-table 
        #basicTable 
        [nzData]="files" 
        [nzFrontPagination]="false"
        [nzShowPagination]="false">
        <thead>
          <tr>
            <th style="width: 30%">文件名</th>
            <th style="width: 10%">文件大小</th>
            <th style="width: 25%">计算进度</th>
            <th style="width: 25%">MD5 哈希值</th>
            <th style="width: 10%">状态</th>
          </tr>
        </thead>
        <tbody>
          @for (data of basicTable.data; track data.id) {
            <tr>
              <td>
                <span [title]="data.name">{{ truncateName(data.name, 40) }}</span>
              </td>
              <td>{{ formatFileSize(data.size) }}</td>
              <td>
                @if (data.status === 'calculating') {
                  <nz-progress 
                    [nzPercent]="data.progress" 
                    nzStatus="active"
                    nzStrokeWidth="8">
                  </nz-progress>
                } @else if (data.status === 'completed') {
                  <nz-progress 
                    [nzPercent]="100" 
                    nzStatus="success"
                    nzStrokeWidth="8">
                  </nz-progress>
                } @else if (data.status === 'error') {
                  <nz-progress 
                    [nzPercent]="0" 
                    nzStatus="exception"
                    nzStrokeWidth="8">
                  </nz-progress>
                } @else {
                  <span style="color: #999;">-</span>
                }
              </td>
              <td>
                @if (data.hash) {
                  <span style="font-family: monospace; font-size: 12px;" [title]="data.hash">
                    {{ truncateHash(data.hash) }}
                  </span>
                } @else {
                  <span style="color: #999;">未计算</span>
                }
              </td>
              <td>
                @switch (data.status) {
                  @case ('pending') {
                    <span style="color: #faad14;">⏳ 等待中</span>
                  }
                  @case ('calculating') {
                    <span style="color: #1890ff;">⚙️ 计算中</span>
                  }
                  @case ('completed') {
                    <span style="color: #52c41a;">✅ 已完成</span>
                  }
                  @case ('error') {
                    <span style="color: #ff4d4f; cursor: help;" [title]="data.errorMsg">
                      ❌ 失败
                    </span>
                  }
                }
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
      
      @if (error) {
        <div style="color: red; margin-top: 10px; padding: 8px; background: #fff2f0; border-radius: 4px;">
          ⚠️ {{ error }}
        </div>
      }
      
      <div style="margin-top: 20px; display: flex; gap: 10px;">
        <button 
          (click)="clearAll()"
          [disabled]="hasCalculatingTask"
          style="padding: 4px 15px;">
          清空所有
        </button>
        <button 
          (click)="startAllPending()"
          [disabled]="!hasPendingTasks || hasCalculatingTask"
          style="padding: 4px 15px; background: #1890ff; color: white; border: none;">
          开始计算 ({{ pendingCount }})
        </button>
        <button 
          (click)="cancelAllCalculating()"
          [disabled]="!hasCalculatingTask"
          style="padding: 4px 15px;">
          取消全部计算
        </button>
      </div>
      
      <div style="margin-top: 16px; font-size: 12px; color: #999;">
        <span>✅ 已完成: {{ completedCount }} | </span>
        <span>⚙️ 计算中: {{ calculatingCount }} | </span>
        <span>⏳ 等待中: {{ pendingCount }}</span>
      </div>
    </div>
  `
})
export class UploaderComponent implements OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  
  files: FileItem[] = [];
  error: string | null = null;
  isLoading = false;
  
  // 并发控制配置
  private readonly MAX_CONCURRENT = 3;
  private processingQueue: string[] = []; // 待处理队列
  
  get hasCalculatingTask(): boolean {
    return this.files.some(f => f.status === 'calculating');
  }
  
  get hasPendingTasks(): boolean {
    return this.files.some(f => f.status === 'pending');
  }
  
  get pendingCount(): number {
    return this.files.filter(f => f.status === 'pending').length;
  }
  
  get calculatingCount(): number {
    return this.files.filter(f => f.status === 'calculating').length;
  }
  
  get completedCount(): number {
    return this.files.filter(f => f.status === 'completed').length;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const fileList = input.files;
    
    if (!fileList || fileList.length === 0) return;

    const files = [...this.files];
    
    // 保存文件引用，稍后用于计算
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // 检查是否已存在同名同大小文件
      const exists = this.files.some(f => f.name === file.name && f.size === file.size);
      if (exists) {
        this.message.warning(`文件 "${file.name}" 已存在，已跳过`);
        continue;
      }
      
      const newFile: FileItem = {
        id: this.generateId(),
        name: file.name,
        size: file.size,
        hash: '',
        progress: 0,
        status: 'pending',
        // 存储 File 对象的引用（注意：File 对象不能序列化，但可以在主线程直接使用）
      };
      files.push(newFile);
      
      // 存储 File 对象到 Map 中
      this.fileMap.set(newFile.id, file);
    }
    
    // 清空 input 值，允许重复选择同一个文件
    input.value = '';
    this.files = files;
    this.cdr.detectChanges();
    
    if (fileList.length > 0) {
      this.message.success(`已添加 ${fileList.length} 个文件`);
    }
  }
  
  // 存储原始 File 对象的 Map
  private fileMap = new Map<string, File>();
  
  private getFileById(id: string): File | undefined {
    return this.fileMap.get(id);
  }

  startAllPending() {
    const pendingFiles = this.files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      this.message.info('没有待计算的文件');
      return;
    }
    
    // 初始化队列
    this.processingQueue = pendingFiles.map(f => f.id);
    this.processQueue();
  }
  
  private processQueue() {
    // 获取当前正在计算的数量
    const currentCalculating = this.calculatingCount;
    const availableSlots = this.MAX_CONCURRENT - currentCalculating;
    
    if (availableSlots <= 0 || this.processingQueue.length === 0) {
      return;
    }
    
    // 启动新的计算任务
    const toStart = Math.min(availableSlots, this.processingQueue.length);
    for (let i = 0; i < toStart; i++) {
      const fileId = this.processingQueue.shift()!;
      this.startHashCalculation(fileId);
    }
  }
  
  private startHashCalculation(fileId: string) {
    const fileItem = this.files.find(f => f.id === fileId);
    const file = this.getFileById(fileId);
    
    if (!fileItem || !file) {
      console.error('文件不存在', fileId);
      return;
    }
    
    // 更新状态
    fileItem.status = 'calculating';
    fileItem.progress = 0;
    this.isLoading = true;
    this.cdr.detectChanges();
    
    // 创建 Worker
    const worker = new Worker(new URL('../../workers/file-hash-worker.ts', import.meta.url));
    fileItem.worker = worker;
    
    worker.onmessage = (event) => {
      const { type, hash, percent, message } = event.data;
      
      switch (type) {
        case 'progress':
          // 更新进度
          fileItem.progress = percent;
          this.cdr.detectChanges();
          break;
          
        case 'result':
          // 计算完成
          fileItem.hash = hash;
          fileItem.status = 'completed';
          fileItem.progress = 100;
          this.cleanupWorker(fileId);
          this.message.success(`${fileItem.name} MD5: ${hash.substring(0, 8)}...`);
          // 继续处理队列
          this.processQueue();
          this.updateLoadingState();
          this.cdr.detectChanges();
          break;
          
        case 'error':
          // 计算失败
          fileItem.status = 'error';
          fileItem.errorMsg = message;
          this.cleanupWorker(fileId);
          this.message.error(`${fileItem.name} 计算失败: ${message}`);
          // 继续处理队列
          this.processQueue();
          this.updateLoadingState();
          this.cdr.detectChanges();
          break;
      }
    };
    
    worker.onerror = (error) => {
      console.error('Worker 错误:', error);
      fileItem.status = 'error';
      fileItem.errorMsg = 'Worker 执行错误';
      this.cleanupWorker(fileId);
      this.message.error(`${fileItem.name} Worker 错误`);
      this.processQueue();
      this.updateLoadingState();
      this.cdr.detectChanges();
    };
    
    // 发送文件到 Worker
    worker.postMessage(file);
  }
  
  private cleanupWorker(fileId: string) {
    const fileItem = this.files.find(f => f.id === fileId);
    if (fileItem?.worker) {
      fileItem.worker.terminate();
      fileItem.worker = undefined;
    }
    // 清理 File 引用以释放内存
    this.fileMap.delete(fileId);
  }
  
  private updateLoadingState() {
    this.isLoading = this.hasCalculatingTask;
  }
  
  cancelAllCalculating() {
    const calculatingFiles = this.files.filter(f => f.status === 'calculating');
    if (calculatingFiles.length === 0) return;
    
    calculatingFiles.forEach(file => {
      this.cleanupWorker(file.id);
      // 恢复为 pending 状态，保留进度
      file.status = 'pending';
      file.progress = 0;
    });
    
    // 清空队列
    this.processingQueue = [];
    
    this.updateLoadingState();
    this.cdr.detectChanges();
    this.message.warning(`已取消 ${calculatingFiles.length} 个计算任务`);
  }

  clearAll() {
    if (this.hasCalculatingTask) {
      this.message.warning('请先取消正在进行的计算任务');
      return;
    }
    
    // 清理所有 Worker
    this.files.forEach(file => {
      this.cleanupWorker(file.id);
    });
    this.fileMap.clear();
    
    this.files = [];
    this.error = null;
    this.isLoading = false;
    this.processingQueue = [];
    this.cdr.detectChanges();
    
    this.message.success('已清空所有文件');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  truncateName(name: string, maxLength: number): string {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  }
  
  truncateHash(hash: string): string {
    if (!hash) return '';
    if (hash.length <= 16) return hash;
    return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  ngOnDestroy() {
    // 清理所有 Worker 和文件引用
    this.files.forEach(file => {
      if (file.worker) {
        file.worker.terminate();
      }
    });
    this.fileMap.clear();
    this.processingQueue = [];
  }
}