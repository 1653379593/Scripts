let url = $request.url, body = null;

// 处理开屏广告
if (url.includes("app.bilibili.com/x/v2/splash/")) {
    let obj = JSON.parse($response.body);
    obj.data?.show && (obj.data.show = []);
    body = JSON.stringify(obj);

// 处理首页Feed流广告
} else if (url.includes("app.bilibili.com/x/v2/feed/index?")) {
    let obj = JSON.parse($response.body);
    if (obj.data?.items) {
        obj.data.items = obj.data.items.filter(item => 
            !item.banner_item && 
            !item.ad_info && 
            !item?.card_goto?.includes("ad") && 
            ["small_cover_v2", "large_cover_v1", "large_cover_single_v9"].includes(item.card_type)
        );
    }
    body = JSON.stringify(obj);

// 处理故事模式Feed流广告
} else if (url.includes("app.bilibili.com/x/v2/feed/index/story?")) {
    let obj = JSON.parse($response.body);
    obj.data?.items && (obj.data.items = obj.data.items.filter(item => 
        !item.ad_info && 
        !item?.card_goto?.includes("ad")
    ));
    body = JSON.stringify(obj);

// 处理底部导航栏
} else if (url.includes("app.bilibili.com/x/resource/show/tab")) {
    let obj = JSON.parse($response.body);
    
    // 强制设置导航栏结构
    obj.data.tab = [
        { 
            id: 477, 
            name: "推荐", 
            tab_id: "推荐tab", 
            uri: "bilibili://pegasus/promo", 
            pos: 1, 
            default_selected: 1 
        },
        { 
            id: 545, 
            name: "追番", 
            tab_id: "bangumi", 
            uri: "bilibili://pgc/home", 
            pos: 2 
        },
        { 
            id: 151, 
            name: "影视", 
            tab_id: "film", 
            uri: "bilibili://pgc/cinema-tab", 
            pos: 3 
        },
        { 
            id: 731, 
            name: "直播", 
            tab_id: "直播tab", 
            uri: "bilibili://live/home", 
            pos: 4 
        },
        { 
            id: 478, 
            name: "热门", 
            tab_id: "热门tab", 
            uri: "bilibili://pegasus/hottopic", 
            pos: 5 
        }
    ];

    // 清理冗余导航项
    obj.data.tab = obj.data.tab.filter(item => 
        ![774, 241, 1284].includes(item.id) // 过滤动画等冗余项
    );

    // 修复底部栏显示
    if (obj.data?.bottom?.length > 3) {
        obj.data.top = [{ 
            id: 176, 
            name: "消息", 
            tab_id: "消息Top", 
            uri: "bilibili://link/im_home", 
            icon: "http://i0.hdslb.com/bfs/archive/d43047538e72c9ed8fd8e4e34415fbe3a4f632cb.png", 
            pos: 1 
        }];
        const keepBottomItems = ["首页", "动态", "我的"];
        obj.data.bottom = obj.data.bottom.filter(item => keepBottomItems.includes(item.name));
    }
    body = JSON.stringify(obj);

// 处理个人页布局
} else if (url.includes("app.bilibili.com/x/v2/account/mine")) {
    let obj = JSON.parse($response.body);
    
    // 强制设置iPad样式菜单
    const ipadSections = {
        ipad_sections: [
            { id: 747, title: "离线缓存", uri: "bilibili://user_center/download", icon: "http://i0.hdslb.com/bfs/feed-admin/9bd72251f7366c491cfe78818d453455473a9678.png" },
            { id: 748, title: "历史记录", uri: "bilibili://user_center/history", icon: "http://i0.hdslb.com/bfs/feed-admin/83862e10685f34e16a10cfe1f89dbd7b2884d272.png" },
            { id: 749, title: "我的收藏", uri: "bilibili://user_center/favourite", icon: "http://i0.hdslb.com/bfs/feed-admin/6ae7eff6af627590fc4ed80c905e9e0a6f0e8188.png" },
            { id: 750, title: "稍后再看", uri: "bilibili://user_center/watch_later", icon: "http://i0.hdslb.com/bfs/feed-admin/928ba9f559b02129e51993efc8afe95014edec94.png" }
        ],
        ipad_upper_sections: [
            { id: 752, title: "创作首页", uri: "/uper/homevc", icon: "http://i0.hdslb.com/bfs/feed-admin/d20dfed3b403c895506b1c92ecd5874abb700c01.png" }
        ],
        ipad_recommend_sections: [
            { id: 755, title: "我的关注", uri: "bilibili://user_center/myfollows", icon: "http://i0.hdslb.com/bfs/feed-admin/fdd7f676030c6996d36763a078442a210fc5a8c0.png" },
            { id: 756, title: "我的消息", uri: "bilibili://link/im_home", icon: "http://i0.hdslb.com/bfs/feed-admin/e1471740130a08a48b02a4ab29ed9d5f2281e3bf.png" }
        ],
        ipad_more_sections: [
            { id: 763, title: "我的客服", uri: "bilibili://user_center/feedback", icon: "http://i0.hdslb.com/bfs/feed-admin/7801a6180fb67cf5f8ee05a66a4668e49fb38788.png" },
            { id: 764, title: "设置", uri: "bilibili://user_center/setting", icon: "http://i0.hdslb.com/bfs/feed-admin/34e8faea00b3dd78977266b58d77398b0ac9410b.png" }
        ]
    };
    
    Object.keys(ipadSections).forEach(key => {
        if (obj.data?.[key]) obj.data[key] = ipadSections[key];
    });

    // 清理移动端冗余模块
    if (obj.data?.sections_v2) {
        const keepItems = ["离线缓存", "历史记录", "我的收藏", "稍后再看", "个性装扮", "我的钱包", "联系客服", "设置"];
        obj.data.sections_v2.forEach(section => {
            // 移除创作中心
            if (["创作中心", "創作中心"].includes(section.title)) {
                section.title = undefined;
                section.type = undefined;
            }
            // 过滤保留项
            section.items = section.items.filter(item => keepItems.includes(item.title));
            // 添加会员购按钮
            if (section.title === "推荐服务") {
                section.items.push({
                    id: 622,
                    title: "会员购",
                    icon: "http://i0.hdslb.com/bfs/archive/19c794f01def1a267b894be84427d6a8f67081a9.png",
                    uri: "bilibili://mall/home"
                });
            }
            // 清理角标
            delete section.be_up_title;
            delete section.tip_icon;
            delete section.tip_title;
        });
        
        // 删除冗余模块
        ["answer", "live_tip", "vip_section", "vip_section_v2"].forEach(key => {
            delete obj.data[key];
        });

        // 伪装VIP状态
        if (!obj.data.vip?.status) {
            obj.data.vip_type = 2;
            obj.data.vip = {
                type: 2,
                status: 1,
                vip_pay_type: 1,
                due_date: 4669824160000 // 2088-01-01
            };
        }
    }
    body = JSON.stringify(obj);

// 处理账号信息VIP状态
} else if (url.includes("app.bilibili.com/x/v2/account/myinfo?")) {
    let obj = JSON.parse($response.body);
    if (obj.data?.vip && !obj.data.vip.status) {
        obj.data.vip = {
            type: 2,
            status: 1,
            vip_pay_type: 1,
            due_date: 4669824160000
        };
    }
    body = JSON.stringify(obj);

// 清理搜索热词
} else if (url.includes("app.bilibili.com/x/v2/search/square")) {
    let obj = JSON.parse($response.body);
    obj.data = [{ type: "history", title: "搜索历史" }];
    body = JSON.stringify(obj);

// 清理直播间广告
} else if (url.includes("api.live.bilibili.com/xlive/app-room/v1/index/getInfoByRoom")) {
    let obj = JSON.parse($response.body);
    if (obj.data) {
        obj.data.activity_banner_info = [];
        obj.data.shopping_info = { is_show: 0 };
    }
    body = JSON.stringify(obj);

// 处理影视/追番页模块
} else if (url.includes("pgc/page/bangumi") || url.includes("pgc/page/cinema/tab?")) {
    let obj = JSON.parse($response.body);
    if (obj.result?.modules) {
        obj.result.modules.forEach(module => {
            // 过滤提示模块
            if (module.style.startsWith("tip") || [1283, 241, 1441, 1284].includes(module.module_id)) {
                module.items = [];
            }
            // 处理横幅模块
            else if (module.style.startsWith("banner")) {
                module.items = module.items.filter(item => item.link.includes("play"));
            }
            // 处理功能模块
            else if (module.style.startsWith("function")) {
                module.items = module.items.filter(item => item.blink.startsWith("bilibili"));
            }
        });
    }
    body = JSON.stringify(obj);
}

body ? $done({ body }) : $done({});
