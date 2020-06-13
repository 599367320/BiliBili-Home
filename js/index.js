const vm = new Vue({
    el: '#app',
    data: {
        navList: [],
        navHide: true,
        navActiveIndex: 0,
        bannerList: [],
        bannerWidth: 96,
        bannerStyle: {
            left: 0,
            transition: 'left .5s'
        },
        bannerActiveIndex: 0,
        videoOldList: [],
        videoGettingData: false,
        videoCount: 0
    },
    methods: {
        handleClick() {
            this.navHide = !this.navHide;
        },
        handleNavClick(index) {
            this.navActiveIndex = index;
        },
        autoMove() {
            setTimeout(() => {
                if (this.bannerActiveIndex === 0) {
                    this.bannerStyle.transition = 'left .5s';
                }

                this.bannerActiveIndex++;
                this.bannerStyle.left = -this.bannerActiveIndex * this.bannerWidth + 'vw';
            }, 1500);
        },
        handleTransitionEnd() {
            if (this.bannerActiveIndex === 3) {
                this.bannerActiveIndex = 0;
                this.bannerStyle.left = 0;
                this.bannerStyle.transition = 'none';
            }
            this.autoMove();
        },
        handleScroll(e) {
            const { scrollHeight, offsetHeight, scrollTop } = e.target;
            const height = scrollHeight - offsetHeight - scrollTop;
            const videoLength = this.videoList.length;

            if (videoLength === this.videoCount) {
                return;
            }

            if (height < 200 && !this.videoGettingData) {
                this.videoGettingData = true;

                axios.get('/video', {
                    params: {
                        start: this.videoList.length,
                        offset: 12
                    }
                }).then(res => {
                    this.videoOldList.push(...res.data);
                    this.videoGettingData = false;
                });
            }
        },
        initNavList(navRes) {
            this.navList = navRes.data;
        },
        initBannerList(bannerRes) {
            const lastEle = {...bannerRes.data[0] };
            lastEle.id = Math.floor(Math.random() * 10000000);
            this.bannerList = [...bannerRes.data, lastEle];
        },
        initVideoList(videoRes) {
            this.videoCount = videoRes.count;
            this.videoOldList = videoRes.data;
        },
        getData() {
            axios.all([
                axios.get('/nav'),
                axios.get('/banner'),
                axios.get('/video', {
                    params: {
                        start: 0,
                        offset: 12
                    }
                })
            ]).then(axios.spread((navRes, bannerRes, videoRes) => {
                //初始化数据
                this.initNavList(navRes);
                this.initBannerList(bannerRes);
                this.initVideoList(videoRes);
            }));
        }
    },
    computed: {
        videoList() {
            //map()：返回值为一个新数组，新数组中的元素为原始数组元素调用函数处理后的值
            return this.videoOldList.map(video => {
                video.play = video.play > 10000 ? video.play / 10000 + '万' : video.play;
                video.rank = video.rank > 10000 ? video.rank / 10000 + '万' : video.rank;
                return video;
            });
        }
    },
    created() {
        //实例初始化后，数据观测和event/watch事件配置已完成，可以进行数据请求，但挂载未开始，$el属性不存在
        this.getData();
    },
    mounted() {
        //挂载完毕，this.$el为编译后的模板，实例完全创建完成
        this.autoMove();
    }
});