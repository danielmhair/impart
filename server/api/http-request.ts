import * as request from 'request';
import * as Q from 'q';

export class HttpRequest {
  public static post(url: string, body: any, headers?: { [key: string]: string }) {
    return Q.Promise((resolve, reject) => {
      if (!url) return reject("No url");
      console.log(`POST ${url} - body: ${JSON.stringify(body)}`);
      request({
        method: "POST",
        url: url,
        body: JSON.stringify(body),
        headers: HttpRequest.getHeaders(headers),
        rejectUnauthorized: false
      }, (error, response, body) => {
        if (error) return reject(error);
        return resolve({status: response.status, data: body, response: response})
      });
    })
  }

  public static get(url: string, headers?: { [key: string]: string }) {
    return Q.Promise((resolve, reject) => {
      if (!url) {
        console.error("You must provide a url for the get request");
        return reject("You must provide get request.");
      }
      console.log("GET " + url);
      request({
        method: "GET",
        url: url,
        headers: HttpRequest.getHeaders(headers),
        rejectUnauthorized: false
      }, (error, response, body) => {
        if (error) return reject(error);
        return resolve({status: response.status, data: body, response: response})
      });
    })
  }

  public static put(url: string, body: any, headers?: { [key: string]: string }) {
    return Q.Promise((resolve, reject) => {
      if (!url) {
        console.error("You must provide a url for the put request");
        return reject("You must provide put request.");
      }
      console.log("GET " + url);
      request({
        method: "PUT",
        url: url,
        body: JSON.stringify(body),
        headers: HttpRequest.getHeaders(headers),
        rejectUnauthorized: false
      }, (error, response, body) => {
        if (error) return reject(error);
        return resolve({status: response.status, data: body, response: response})
      });
    })
  }

  public static delete(url: string, headers?: { [key: string]: string }) {
    return Q.Promise((resolve, reject) => {
      if (!url) {
        console.error("You must provide a url for the put request");
        return reject("You must provide id with delete request.");
      }
      console.log("GET " + url);
      request({
        method: "DELETE",
        url: url,
        headers: HttpRequest.getHeaders(headers),
        rejectUnauthorized: false
      }, (error, response, body) => {
        if (error) return reject(error);
        return resolve({status: response.status, data: body, response: response})
      });
    })
  }

  private static getHeaders(headers) {
    if (!headers) {
      headers = {}
    }
    headers["Content-Type"] = "application/json";
    return headers
  }
}