export class UrlBuilder {
  private url: URL;
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost') {
    this.baseUrl = baseUrl;
    this.url = new URL(baseUrl);
  }

  addParam(key: string, value: string) {
    this.url.searchParams.append(key, value);

    return this;
  }

  addPagination(pageNumber: number, pageSize: number) {
    this.url.searchParams.append('PageNumber', String(pageNumber));
    this.url.searchParams.append('PageSize', String(pageSize));

    return this;
  }

  addSubdirectory(subDirectory: string) {
    const isFirstSubDirectory = this.url.pathname === '/';
    this.url.pathname = isFirstSubDirectory
      ? this.url.pathname + subDirectory
      : this.url.pathname + `/${subDirectory}`;

    return this;
  }

  build(fullAddress = false) {
    if (fullAddress) return this.url.href;

    return `${this.url.pathname}${this.url.search}`;
  }

  clear() {
    this.url = new URL(this.baseUrl);
  }
}
