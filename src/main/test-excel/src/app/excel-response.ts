export interface ExcelResult {
    status: string;
    value: string;
}

export interface ExcelResponse {
    name: string;
    result: ExcelResult;
}
