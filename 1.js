// Intercept http-response for Bilibili tab resource and reorder tabs
// Usage: save as bilibili_reorder_tabs.js and set script-path 指向该文件（或上传到 raw.githubusercontent 并使用 URL）
// Desired order (title 字段匹配): ["推荐","番剧","影视","直播","热门"]

(() => {
  try {
    let body = $response && $response.body;
    if (!body) return $done({});
    let obj = JSON.parse(body);

    // 尝试找到包含 tabs 数组的容器（常见位置：obj.data 或 obj.result）
    let container = null;
    if (obj.data && Array.isArray(obj.data.tabs)) container = obj.data;
    else if (obj.result && Array.isArray(obj.result.tabs)) container = obj.result;
    else {
      for (let k in obj) {
        if (obj[k] && Array.isArray(obj[k].tabs)) {
          container = obj[k];
          break;
        }
      }
    }

    if (!container || !Array.isArray(container.tabs)) {
      // 未找到 tabs，直接返回原始 body
      $done({ body });
      return;
    }

    const desiredOrder = ["推荐", "番剧", "影视", "直播", "热门"];
    const tabs = container.tabs;
    const placed = new Set();
    const newTabs = [];

    // 先按 desiredOrder 放置能匹配到的标签（优先匹配 title 字段，其次匹配 name 字段）
    for (const want of desiredOrder) {
      for (const t of tabs) {
        if (!placed.has(t) && (t.title === want || t.name === want)) {
          newTabs.push(t);
          placed.add(t);
        }
      }
    }

    // 再把剩下的按原始顺序追加
    for (const t of tabs) {
      if (!placed.has(t)) {
        newTabs.push(t);
        placed.add(t);
      }
    }

    container.tabs = newTabs;
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({ body: $response && $response.body });
  }
})();
