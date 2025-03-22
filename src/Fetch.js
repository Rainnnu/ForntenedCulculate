import axios from 'axios';
//创建instance实例
const instance =axios.create({
    //默认请求端口为
    baseURL:'http://localhost:8080/'
})

//添加请求拦截
instance.interceptors.request.use(
    //设置请求头配置信息
    config=>{  
        config.headers.token =JSON.parse(window.localStorage.getItem('token'))
       // console.log(config.headers.token )
        return config
    },
    //设置请求错误处理函数
    error=>{
        return Promise.reject(error)
    }

)

//添加响应拦截器
instance.interceptors.response.use(
    //设置响应正常时的处理函数
    response=>{
        return response
    },

   //设置请求错误处理函数
   error=>{
    return Promise.reject(error)
}
    

)







//默认导出
export default instance