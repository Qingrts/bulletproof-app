import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseProductStrategy } from "./base.strategy";
import { HotelModel } from "../models";

@Injectable({ providedIn: 'root' })
export class HotelStrategy extends BaseProductStrategy<HotelModel> {
  
}