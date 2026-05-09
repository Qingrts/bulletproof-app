/// <reference lib="webworker" />
import SparkMD5 from 'spark-md5';

addEventListener('message', ({ data }) => {
  console.log('data', data);
  const file = data as File;
  const spark = new SparkMD5.ArrayBuffer();
  const reader = new FileReader();
  
  // 每块读取 2MB
  const chunkSize = 2 * 1024 * 1024; 
  let currentChunk = 0;
  const chunks = Math.ceil(file.size / chunkSize);

  reader.onload = (e: any) => {
    // 将读取到的二进制数据添加到 spark 实例中
    spark.append(e.target.result); 
    currentChunk++;

    if (currentChunk < chunks) {
      loadNext();
      // 可选：向主线程发送进度
      postMessage({ type: 'progress', percent: Math.round((currentChunk / chunks) * 100) });
    } else {
      // 计算完成，发送最终结果
      const hash = spark.end();
      postMessage({ type: 'result', hash });
    }
  };

  reader.onerror = () => {
    postMessage({ type: 'error', message: '文件读取失败' });
  };

  const loadNext = () => {
    const start = currentChunk * chunkSize;
    const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    // 只切片当前需要处理的部分
    reader.readAsArrayBuffer(file.slice(start, end));
  };

  loadNext();
});