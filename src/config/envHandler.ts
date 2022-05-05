import { DataSource } from "shtrudel";

const DotenvDataSrouce: DataSource = (key: string) => process.env[key];
export default DotenvDataSrouce;