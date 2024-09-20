class HttpClient {
  async get(url, headers) {
    const response = await fetch(url, { headers });
    return response.json();
  }

  async post(url, headers, body) {
    await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  }
}

export const httpClient = new HttpClient();
