// 全局变量声明区域
const fdata = {
  apiurl: 'https://hexo-friendcircle-api.vercel.app/api',
  initnumber: 2, //【可选】页面初始化展示文章数量
  stepnumber: 1, //【可选】每次加载增加的篇数
  opentype: '_blank' ,//【可选】'_blank'打开新标签,'_self'本窗口打开,默认为'_blank'
  nofollow: true ,//【可选】开启禁止搜索引擎抓取,默认开启
  preload: ''//【可选】加载动画图片链接
}

// 排序算法
function quickSort(arr, keyword){
  // keyword传入值'time'（按发布时间排序）或'updated'（按更新时间排序）
  if(arr.length == 0){return [];}
  var left = [];
  var right = [];
  var selectItem = arr[0];
  for(var i = 1; i < arr.length; i++){
    if(arr[i][keyword] > selectItem[keyword]){
      left.push(arr[i]);
    }
    else{
      right.push(arr[i]);
    }
  }
  return quickSort(left, keyword).concat(selectItem, quickSort(right, keyword));
}
// ======================================================

// 打印友链基本信息
function loadStatistical(sdata){
// 友链页面的挂载容器
var container = document.getElementById('fcircleContainer');
// 基本信息的html结构
var messageBoard =`
<div id="fMessageBoard">
  <div class="fUpdatedTime">
    <span class="fLabel">最近更新时间：</span><span class="fMessage">${sdata.last_updated_time}</span>
  </div>
  <div class="fMessageItem">
    <div class="fActiveFriend fItem">
      <span class="fLabel">活跃友链数</span>
      <meter class="fMeasureBar" value="${sdata.active_num}" min="0" low="${sdata.friends_num*0.3}" high="${sdata.friends_num*0.7}" max="${sdata.friends_num}"></meter>
      <span class="fMessage">${sdata.active_num}/${sdata.friends_num}</span>
    </div>
    <div class="fErrorSite fItem">
      <span class="fLabel">失联友链数</span>
      <meter class="fMeasureBar" value="${sdata.error_num}" min="0" low="${sdata.friends_num*0.3}" high="${sdata.friends_num*0.7}" max="${sdata.friends_num}"></meter>
      <span class="fMessage">${sdata.error_num}/${sdata.friends_num}</span>
    </div>
    <div class="fArticleNum fItem">
      <span class="fLabel">当前库存</span>
      <meter class="fMeasureBar" value="${sdata.article_num}" min="0" max="${Math.ceil(Number( sdata.article_num) / 100) * 100}"></meter>
      <span class="fMessage">${sdata.article_num}/${Math.ceil(Number( sdata.article_num) / 100) * 100}</span>
    </div>
  </div>
</div>
`;
// 原则上信息面板应该在最前面，所以用afterbegin表示从开始符后面插入
container.insertAdjacentHTML('afterbegin', messageBoard);

// 加载更多按钮
var loadMoreBtn = `
<div id="fcircleMoreBtn" onclick="loadMoreArticle()">
  <i class="fas fa-angle-double-down"></i>
</div>
`
// 为了不影响文章加载，选择afterend表示从结束符后面插入
container.insertAdjacentHTML('afterend', loadMoreBtn);
}

// ======================================================
// 打印友链内容
function loadArticleItem(datalist,start,end){
// 声明友链页面的挂载容器
var container = document.getElementById('fcircleContainer');
// 循环读取输出友链信息
for (var i = start;i<end;i++){
var item = datalist[i];
var articleItem=`
  <div class="fArticleItem">
    <div class="fArticleAvatar">
      <a class="fArticlelink fAvatar" href="${item.link}">
        <img src="${item.avatar}" alt="avatar">
      </a>
      <div class="fArticleAuthor">
        ${item.author}
      </div>
    </div>
    <div class="fArticleMessage">
      <a class="fArticleTitle"  href="${item.link}" data-title="${item.title}">
        ${item.title}
      </a>
      <div class="fArticleTime">
        <span class="fArticleCreated"><i class="far fa-calendar-alt">发表于</i>${item.created}</span>
        <span class="fArticleUpdated"><i class="fas fa-history">更新于</i>${item.updated}</span>
      </div>
    </div>
  </div>
`
// 为了便于和后续拼接，选择从容器尾部插入
container.insertAdjacentHTML('beforeend', articleItem);
  }
}

// ======================================================
// 抓取友链api信息
fetch(fdata.apiurl)
  .then(res => res.json())
  .then(json =>{
    // 获取友链朋友圈基本信息
    var statistical_data = json.statistical_data;
    //存入本地存储
    localStorage.setItem("statisticalList",JSON.stringify(statistical_data))
    // console.log(statistical_data);
    // 获取友链朋友圈文章列表
    var article_data = eval(json.article_data);
    // console.log(article_data);
    // 按创建时间排序
    var article_sortcreated = quickSort(article_data,'time');
    //存入本地存储
    localStorage.setItem("createdList",JSON.stringify(article_sortcreated))
    // loadArticleItem(article_sortcreated ,0,fdata.initnumber)
    // 按更新时间排序
    var article_sortupdated = quickSort(article_data,'updated');
    //存入本地存储
    localStorage.setItem("updatedList",JSON.stringify(article_sortupdated))
    // console.log(article_sortcreated);
    // console.log(article_sortupdated);
  }
)
function initFriendCircle(){
  var statistical_data = JSON.parse(localStorage.getItem("statisticalList"));
  var article_sortcreated = JSON.parse(localStorage.getItem("createdList"));
  // var article_sortupdated = JSON.parse(localStorage.getItem("updatedList"));
  loadStatistical(statistical_data);
  loadArticleItem(article_sortcreated ,0,fdata.initnumber)
  // loadArticleItem(article_sortcreated ,0,fdata.initnumber)
}



function loadMoreArticle(){
  // 获取当前已加载的文章数
  var currentArticle = document.getElementsByClassName('fArticleItem').length;
  var article_sortcreated = JSON.parse(localStorage.getItem("createdList"));
  // console.log(article_sortcreated);
  // 从当前文章的下一篇开始，加载下一阶程篇数
  loadArticleItem(article_sortcreated,currentArticle,currentArticle + fdata.stepnumber)
}
