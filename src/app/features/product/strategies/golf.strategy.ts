import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseProductStrategy } from "./base.strategy";
import { GolfModel } from "../models";

@Injectable({ providedIn: 'root' })
export class GolfStrategy extends BaseProductStrategy<GolfModel> {
  
}