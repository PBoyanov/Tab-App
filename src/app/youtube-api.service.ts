import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
const API_TOKEN = 'AIzaSyBW0gVCT3M9cLkWUa2sE916HErIyInI5As';
const MAX_RESULTS = 25;

@Injectable()
export class YoutubeApiService {
    constructor(private _http: Http) { }

    search(query) {
        return this._http.get(`${BASE_URL}?q=${query}&part=snippet&key=${API_TOKEN}&maxResults=${MAX_RESULTS}`)
            .map((res:Response) => res.json())
            .map(json => json.items);
    }
}