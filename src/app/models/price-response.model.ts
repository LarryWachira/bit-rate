import { Price } from './price.model';

export interface PriceResponse {
    message?: string;
    data?: Price[];
}