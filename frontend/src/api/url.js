import axios from "axios"

const BACKEND_URL = axios.create({
    baseURL: "http://a96632fd6bf694a3cb80937733f78843-1967690016.ap-south-1.elb.amazonaws.com:4001/api/v1/noteapp/"
})

export default BACKEND_URL