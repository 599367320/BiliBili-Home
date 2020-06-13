axios.defaults.baseURL = 'https://developer.duyiedu.com/vue/bz';

//响应拦截器
axios.interceptors.response.use((response) => {
    const { status } = response;

    if (status === 200) {
        return response.data;
    }
    return response;
});