declare const dotenv: any;
declare const pkg: any;
declare const sub_port: () => any[];
interface ResponseObject {
    data: any;
    code: number;
    state: boolean;
    message: string;
}
declare const ResponseStructure: ResponseObject;
