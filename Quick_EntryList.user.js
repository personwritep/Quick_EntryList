// ==UserScript==
// @name        Quick EntryList
// @namespace        http://tampermonkey.net/
// @version        2.3
// @description        記事の編集・削除の機能拡張
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/entry/srventrylist*
// @match        https://blog.ameba.jp/ucs/entry/srventry*draft*
// @match        https://blog.ameba.jp/ucs/top.do
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameblo.jp
// @grant        none
// @updateURL        https://github.com/personwritep/Quick_EntryList/raw/main/Quick_EntryList.user.js
// @downloadURL        https://github.com/personwritep/Quick_EntryList/raw/main/Quick_EntryList.user.js
// ==/UserScript==


if(location.pathname.includes('srventrylist')){ // 記事の編集・削除の場合

    let UserID; // アメーバログインID

    let help_url='https://ameblo.jp/personwritep/entry-12742971012.html';

    let year_list=[]; // 選択年度の配列
    let point_ym; // ユーザーの指定年月のクエリー文字
    let qe_ym=[]; // Quick EntryList 復帰ポイントのユーザー設定
    let p_open=0; // qe_panel の表示・非表示



    let amebaId=document.querySelector('.amebaId');
    if(amebaId){
        UserID=amebaId.textContent; }

    if(!UserID){
        alert(
            '⛔　======== Quick EntryList ========\n'+
            '　　ユーザーIDが取得出来ないため登録ページを表示できません\n'+
            '　　ページのリロードを試し、アメーバのログイン状態に関して\n'+
            '　　確認をしてください'); }



    let read_json=localStorage.getItem('QE_Point_'+UserID); // ローカルストレージ 保存名
    qe_ym=JSON.parse(read_json);
    if(qe_ym==null){
        let old_read_json=localStorage.getItem('QE_Point'); // 旧ローカルストレージ 保存名
        qe_ym=JSON.parse(old_read_json);
        if(qe_ym==null){ // 新旧ともにストレージ保存がない場合
            qe_ym=['', '?', '?', '?', '?', '?', '?']; }}

    for(let k=qe_ym.length+1; k<8; k++){ // 配列数が旧く少ない場合 7個に増す
        qe_ym.push('?'); }

    let write_json=JSON.stringify(qe_ym);
    localStorage.setItem('QE_Point_'+UserID, write_json); // ローカルストレージ 保存


    let qe_copy=0; // 複製フラグ
    if(sessionStorage.getItem('QE_copy')){ // ストレージより 取得
        qe_copy=sessionStorage.getItem('QE_copy'); }
    sessionStorage.setItem('QE_copy', qe_copy); // ストレージ 保存



    let help_SVG=
        '<svg class="qe_h" height="20" width="24" viewBox="0 0 210 220">'+
        '<path d="M89 22C71 25 54 33 41 46C7 81 11 142 50 171C58 177 '+
        '68 182 78 185C90 188 103 189 115 187C126 185 137 181 146 175'+
        'C155 169 163 162 169 153C190 123 189 80 166 52C147 30 118 18'+
        ' 89 22z" style="fill:#999;"></path>'+
        '<path d="M67 77C73 75 78 72 84 70C94 66 114 67 109 83C106 91'+
        ' 98 95 93 101C86 109 83 116 83 126L111 126C112 114 122 108 1'+
        '29 100C137 90 141 76 135 64C127 45 101 45 84 48C80 49 71 50 '+
        '68 54C67 56 67 59 67 61L67 77M85 143L85 166L110 166L110 143L'+
        '85 143z" style="fill:#fff;"></path>'+
        '</svg>';

    let disp_qe=
        '<div id="disp_qe">'+
        '<span class="qe_s">表示年月：</span>'+
        '<button class="qe_button" id="qe_b1"></button>'+
        '<button class="qe_button" id="qe_b2"></button>'+
        '<button class="qe_button" id="qe_b3"></button>'+
        '<button class="qe_button" id="qe_b4"></button>'+
        '<button class="qe_button" id="qe_b5"></button>'+
        '<button class="qe_button" id="qe_b6"></button>'+
        '<button class="qe_button" id="qe_top">Top</button>'+
        '<a href="'+ help_url +'" target="_blank" rel="noopener">'+ help_SVG +'</a>'+

        '<div class="qe_help">'+

        '<div class="qe_help_d d1">'+
        '<p>ファイルメニュー</p>'+
        '<p>　　Alt+Click ▼ </p>'+
        '</div>'+

        '<div class="qe_help_d">'+
        '<p>　 Ctrl+Click：現在の表示年月を登録　　Ctrl+Shift+Click：登録を削除　</p>'+
        '<p>▼ Click：登録ページを表示</p>'+
        '</div></div>'+

        '</div>'+

        '<div id="qe_panel">'+
        '<button class="write_button">ファイル保存</button>'+
        '<button class="read_button">ファイルから読込み</button>'+
        '<input type="file" class="read_file">'+
        '<button class="close">✖</button>'+
        '</div>';

    let Main_h1=document.querySelector('#ucsMainLeft h1');
    if(!document.querySelector('#disp_qe') && Main_h1){
        Main_h1.insertAdjacentHTML('beforeend', disp_qe); }



    let ym_select=
        '<select id="ym_select_box" size="15"></select>';

    let entrySort=document.querySelector('#entrySort');
    if(!document.querySelector('#ym_select_box') && entrySort){
        entrySort.insertAdjacentHTML('beforeend', ym_select); }



    let qe_style=
        '<style id="qe_style">'+
        '#disp_qe { float: right; margin-top: -2px; background: #fff; position: relative; } '+
        '.qe_s { position: relative; font: normal 14px Meiryo; cursor: default; } '+
        '.qe_button { height: 25px; max-width: 72px; font-size: 15px; '+
        'margin: 0 3px; padding: 2px 6px; border: 1px solid #aaa; border-radius: 3px; '+
        'background: #fff; vertical-align: -1px; cursor: pointer; } '+
        '.qe_button:hover { outline: 1px solid #2196f3; } '+
        '.qe_h { vertical-align: -6px; } '+

        '.qe_help { position: absolute; top: -46px; left: -67px; z-index: 10; '+
        'font: normal 14px/18px Meiryo; display: none; } '+
        '.qe_help_d { padding: 4px 8px 1px; border: 1px solid #aaa; background: #fff; } '+
        '.qe_help_d.d1 { margin-right: 10px; } '+
        '.qe_help_d p { white-space: nowrap; } '+
        '#qe_panel { position: fixed; top: 0; right: calc(50% - 340px); z-index: 20; '+
        'padding: 6px 10px 8px 25px; background: #b0bec5; display: none; } '+
        '#qe_panel button { padding: 2px 6px 0; margin-right: 15px; } '+
        '#qe_panel .read_file { display: none; } '+

        '#entrySort { display: flex; position: relative; overflow: visible; z-index: 3; } '+
        '#entryYear { display: flex; justify-content: space-between; '+
        'align-items: center; width: 120px; margin: 0 5px; } '+
        '#yearText { position: absolute; top: 6px; left: 84px; width: 16px; '+
        'padding: 0 1px; font-size: 14px; color: #1976d2; z-index: 1; } '+
        '#ym_select_box { position: absolute; top: 0; left: 24px; height: 28px; width: 81px; '+
        'padding: 1px 0 0 0; text-align: center; outline: none; border: 1px solid #ccc; '+
        'background: #fff; scrollbar-width: none; overflow: hidden; cursor: pointer; } '+
        '#ym_select_box:focus { height: auto; box-shadow: 0 10px 20px 0 #00000050; '+
        'overflow-y: scroll; overscroll-behavior-y: none; z-index: 1; } '+
        '#ym_select_box option { font: bold 18px Meiryo; color: #333; background: #fff; '+
        'padding: 1px 10px 0 0; } '+
        '#ym_select_box option:hover { background: #bbdefb; } '+

        '#ucsContent { margin-bottom: 0; } '+
        '#ucsMain { padding-bottom: 0; } '+
        '#globalHeader { min-width: 930px !important; } '+
        'li.ucs_sw { position: absolute !important; right: -140px; width: 90px; } '+
        'li.ucs_sw a:before { content: "\\EA31" !important; } '+
        '</style>';

    if(!document.querySelector('#qe_style')){
        document.documentElement.insertAdjacentHTML('beforeend', qe_style); }



    for(let k=1; k<7; k++){
        disp_button(k)}


    set_year_list();
    disp_select();
    select_year();
    point_set(1);
    point_set(2);
    point_set(3);
    point_set(4);
    point_set(5);
    point_set(6);
    point_top();

    disp_help();
    scheduled();
    weekend();
    to_ucstop();


    function disp_button(n){
        let button=document.querySelector('#qe_b'+n);
        if(button){
            let date_raw;
            let ny;
            let nm;
            if(qe_ym[n].indexOf("&so=")!=-1){ // 古い順表示の場合
                date_raw=qe_ym[n].substring(0, qe_ym[n].indexOf("&so=")); }
            else{
                date_raw=qe_ym[n]; }

            ny=date_raw.slice(-6, -2);
            nm=date_raw.slice(-2);
            if((ny>1999 && ny<2100) && (nm>0 && nm<13)){
                button.textContent=ny+'-'+nm; }
            else{ // 未登録の場合
                button.textContent='┄┄┄'; }}}



    function select_year(){
        let set_year;
        let ym_select_box=document.querySelector('#ym_select_box');
        if(ym_select_box){
            ym_select_box.onchange=function(){
                set_year=ym_select_box.options[ym_select_box.selectedIndex].value;
                location.href=
                    "https://blog.ameba.jp/ucs/entry/srventrylist.do?entry_ym="+
                    set_year +"01"; }

            ym_select_box.onblur=function(){
                setTimeout(()=>{
                    ym_select_box.value=ym_select_box.value;
                }, 20 ); }}}



    function set_year_list(){
        let currentTime=new Date();
        let year=currentTime.getFullYear();
        for(let k=2000; k<year+2; k++){
            year_list.push(k); }
        year_list.reverse(); }



    function disp_select(){
        let page_year;
        let query;
        let input_year=document.querySelector('input[name="urlParam"]');
        if(input_year){
            query=input_year.value;
            page_year=query.slice(-6, -2); }

        if(!page_year){
            let currentTime=new Date();
            let current_year=currentTime.getFullYear();
            page_year=current_year; }

        let ym_select_box=document.querySelector('#ym_select_box');
        if(ym_select_box){
            for(let k=0; k<year_list.length; k++){
                let option=document.createElement('option');
                option.text=year_list[k];
                option.value=year_list[k];
                ym_select_box.appendChild(option);
                if(page_year==year_list[k]){
                    option.selected=true; }}}}



    function point_set(n){
        let point_button=document.querySelector('#qe_b'+n);
        if(point_button){
            point_button.onclick=function(event){
                if(!event.ctrlKey){ // 登録ページの表示
                    location.href=
                        "https://blog.ameba.jp/ucs/entry/srventrylist.do"+ qe_ym[n]; }

                else{
                    if(!event.shiftKey){ // ページを登録
                        let date_raw;
                        let ny;
                        let nm;
                        let current_search; // 現在のクエリー文字列

                        if(!location.search){ //「記事の編集・削除」の初期表示の場合
                            let currentTime=new Date();
                            ny=currentTime.getFullYear();
                            nm=('0'+(currentTime.getMonth()+1)).slice(-2); }

                        else{
                            if(location.search.indexOf("&so=")!=-1){ // 古い順表示の場合
                                date_raw=location.search.substring(0, location.search.indexOf("&so=")); }
                            else{
                                date_raw=location.search; }
                            ny=date_raw.slice(-6, -2);
                            nm=date_raw.slice(-2); }

                        if((ny>1999 && ny<2100) && (nm>0 && nm<13)){
                            let ok=confirm(
                                "　💢 Quick指定年月の登録を変更します\n\n"+
                                "　「OK」を押すと現在選択している "+ny+"年 "+nm+"月 を登録します" );
                            if(ok){
                                current_search=location.search;
                                if(!current_search){
                                    current_search='?entry_ym='+ny+nm; }
                                qe_ym[n]=current_search;
                                let write_json=JSON.stringify(qe_ym); // ローカルストレージ 保存
                                localStorage.setItem('QE_Point_'+UserID, write_json);
                                disp_button(n); }}

                        else{ // クエリーの値が不正値の場合
                            let ok=confirm(
                                "　💢 クエリー文字列が異常値で登録できません\n\n"+
                                "　「OK」を押すと先頭ページに移動します" );
                            if(ok){
                                location.href=
                                    "https://blog.ameba.jp/ucs/entry/srventrylist.do"; }}}

                    else{ //「Ctrl+Shift」で登録削除
                        let ok=confirm(
                            "　💢 選択した指定年月の登録を削除します\n" );
                        if(ok){
                            qe_ym[n]='?';
                            let write_json=JSON.stringify(qe_ym); // ローカルストレージ 保存
                            localStorage.setItem('QE_Point_'+UserID, write_json);
                            disp_button(n); }}}

            }}} // point_set()



    function point_top(){
        let point_top=document.querySelector('#qe_top');
        if(point_top){
            point_top.onclick=function(event){
                location.href=
                    "https://blog.ameba.jp/ucs/entry/srventrylist.do"; }}}



    function disp_help(){
        let qe_s=document.querySelector('#disp_qe .qe_s');
        let qe_help=document.querySelector('#disp_qe .qe_help');
        if(qe_s && qe_help){
            qe_s.addEventListener('mouseover', function(){
                qe_help.style.display='flex'; });

            qe_s.addEventListener('mouseleave', function(){
                qe_help.style.display='none'; }); }}



    function scheduled(){
        let now=get_now();

        let page_year=document.querySelector('#entryYear #year');
        if(page_year){
            page_year=page_year.textContent; }
        else{
            page_year='2000'; }

        let entry_item=document.querySelectorAll('.entry-item');
        for(let k=0; k<entry_item.length; k++){
            let p_title=entry_item[k].querySelector('.titleCol h2 a');

            let p_time=entry_item[k].querySelector('#entryList .date');
            let p_date=p_time.textContent;
            p_date=page_year + p_date.replace(/[^0-9]/g, '');
            p_date=parseInt(p_date, 10); // 文字列を10進数に変換
            if(p_date>now){
                p_time.style.color='#fff';
                p_time.style.background='#2196f3';
                if(p_title){
                    p_title.style.color='#000'; }}}

    } // scheduled()



    function weekend(){
        let year_=document.querySelector('#year').textContent;
        let year=parseInt(year_, 10);

        let date=document.querySelectorAll('.entry-item .date');
        for(let k=0; k<date.length; k++){
            let day_s=date[k].textContent;
            let mon=parseInt(day_s.slice(0, 2), 10) -1;
            let day=parseInt(day_s.slice(3, 5), 10);
            let today=new Date(year, mon, day);
            if(today.getDay()==0){
                date[k].style.boxShadow='2px 0 0 #fff, 6px 0 0 red'; }
            if(today.getDay()==6){
                date[k].style.boxShadow='2px 0 0 #fff, 6px 0 0 #2196f3'; }}

    } // weekend()



    function to_ucstop(){
        let ucs_sw=
            '<li class="ucs_sw">'+
            '<a href="https://blog.ameba.jp/ucs/top.do">管理トップ</a></li>';

        let ucsSubMenu=document.querySelector('#ucsSubMenu');
        if(!ucsSubMenu.querySelector('.ucs_sw')){
            ucsSubMenu.insertAdjacentHTML('beforeend', ucs_sw); }}



    let copy_button=document.querySelectorAll('.actions .process[onclick*="copyEntry"]');
    let entry_title=document.querySelectorAll('input[name="disp_entry_title"]');
    for(let k=0; k<copy_button.length; k++){
        copy_button[k].onmousedown=(event)=>{
            let title=entry_title[k].value;
            title=title.substring(0, 10); // タイトルの先頭10文字
            sessionStorage.setItem('QE_copy', title); }} // ストレージの複製フラグをセット



    if(qe_copy!=0){ // 複製操作で最新ページを開いた時に実行
        let title=sessionStorage.getItem('QE_copy');
        sessionStorage.setItem('QE_copy', 0); // ストレージの複製フラグをリセット

        let entry_title=document.querySelectorAll('input[name="disp_entry_title"]');
        let entry_id=document.querySelectorAll('input[name="entry_id"]');
        let entry_item=document.querySelectorAll('.entry-item');
        let temp_id=0;
        let index=-1;
        for(let k=0; k<entry_id.length; k++){
            if(temp_id<entry_id[k].value/1){
                index=k;
                temp_id=entry_id[k].value; }} // IDの最新記事を取得

        if(entry_title[index].value.includes(title)){ // タイトルがコピー元と一致
            entry_item[index].style.outline='2px solid #2196f3'; }} // 複製した記事の青枠表示



    let qe_s=document.querySelector('#disp_qe .qe_s');
    let qe_panel=document.querySelector('#qe_panel');
    if(qe_s && qe_panel){
        qe_s.onclick=function(event){
            if(event.altKey){
                event.preventDefault();
                event.stopImmediatePropagation();
                if(p_open==0){
                    p_open=1;
                    qe_panel.style.display="block";
                    backup(qe_panel); }
                else{
                    p_open=0;
                    qe_panel.style.display="none" }
            }}}


    function backup(qe_panel){
        let write_button=qe_panel.querySelector('.write_button');
        let read_button=qe_panel.querySelector('.read_button');
        let read_file=qe_panel.querySelector('.read_file');
        let close=qe_panel.querySelector('.close');


        write_button.onclick=function(){
            let write_json=JSON.stringify(qe_ym);
            let blob=new Blob([write_json], {type: 'application/json'});
            let a_elem=document.createElement('a');
            a_elem.href=URL.createObjectURL(blob);
            a_elem.download='QuickEntryList_'+UserID+'.json'; // 保存ファイル名
            a_elem.click();
            URL.revokeObjectURL(a_elem.href); }


        read_button.onclick=function(){
            read_file.click(); }

        read_file.addEventListener("change" , function(){
            if(!(read_file.value)) return; // ファイルが選択されない場合
            let file_list=read_file.files;
            if(!file_list) return; // ファイルリストが選択されない場合
            let file=file_list[0];
            if(!file) return; // ファイルが無い場合

            let file_reader=new FileReader();
            file_reader.readAsText(file);
            file_reader.onload=function(){
                if(file_reader.result.slice(0, 6)=='["","?'){ // QuickEntryList.jsonの確認
                    qe_ym=JSON.parse(file_reader.result); // 読込みデータで上書き処理

                    let write_json=JSON.stringify(qe_ym);
                    localStorage.setItem('QE_Point_'+UserID, write_json); // ローカルストレージ 保存

                    for(let k=1; k<7; k++){
                        disp_button(k)}
                }}});


        close.onclick=function(){
            if(p_open==1){
                p_open=0;
                qe_panel.style.display='none'; }}

    } // backup()

} // 記事の編集・削除の場合




if(location.pathname.includes('top.do')){ // 管理トップの場合
    function get_future(dt){ // 日付け文字列が 未来か否かを判定
        let regex = /[^0-9]/g;
        let pdt=dt.replace(regex, "");
        pdt=parseInt(pdt, 10);

        let now=get_now();
        if(pdt>now){
            return true; }
        else{
            return false; }}


    let recentE=document.querySelectorAll('.recentEntry__item');
    for(let k=0; k<recentE.length; k++){
        let EntryStatus=recentE[k].querySelector('.recentEntry__itemEntryStatus');
        if(EntryStatus && EntryStatus.textContent.includes('まだ投稿されていません')){
            EntryStatus.style.overflow='hidden';

            if(EntryStatus.textContent.includes('下書き中')){
                let time=recentE[k].querySelector('.recentEntry__itemSubInfo time');
                if(time){
                    let dt=time.getAttribute('datetime');
                    if(get_future(dt)){ // 投稿日付が未来
                        EntryStatus.innerHTML=
                            '<span style="padding:2px 4px; margin: 0 4px 0 -4px; '+
                            'color: #fff; background: #2196f3;">下書き</span>未来記事'; }
                    else{
                        EntryStatus.innerHTML=
                            '<span style="padding:2px 4px; margin: 0 -4px; '+
                            'color: #fff; background: #2196f3;">下書き</span>'; }}}
            else{ // 下書きでない未来記事
                EntryStatus.innerHTML=
                    '未来記事'; }}}


    let time=document.querySelectorAll('.recentEntry__itemSubInfo time');
    for(let k=0; k<time.length; k++){
        let dt=time[k].getAttribute('datetime');
        let year=parseInt(dt.slice(0, 4), 10);
        let mon=parseInt(dt.slice(5, 7), 10) -1;
        let day=parseInt(dt.slice(8, 10), 10);
        let today=new Date(year, mon, day);
        if(today.getDay()==0){
            time[k].style.boxShadow='-7px -1px 0 -2px #fff, -11px -1px 0 -2px red'; }
        if(today.getDay()==6){
            time[k].style.boxShadow='-7px -1px 0 -2px #fff, -11px -1px 0 -2px #2196f3'; }}

} // 管理トップの場合



function get_now(){ // 時刻比較のための現在時刻の整数化
    let currentDate = new Date();
    let year=currentDate.getFullYear();
    let month=currentDate.getMonth() + 1;
    let date=currentDate.getDate();
    let hour=currentDate.getHours();
    let minute=currentDate.getMinutes();

    function formatTime(val) {
        return ("0" + val).slice(-2); } //「0」付きで2桁テキストに変更

    let now=year + formatTime(month) + formatTime(date) +
        formatTime(hour) + formatTime(minute);

    return parseInt(now, 10);

} // get_now




if(location.pathname.includes('draft')){ // 下書き保存確認画面の場合
    //「記事の編集・削除を表示」ボタンを表示

    let el_button=
        '<div id="el_button">'+
        '<svg viewBox="0 0 120 120">'+
        '<path d="M0 0L0 112L112 112L112 0L0 0z" style="fill: #fff"></path>'+
        '<path d="M23 21L45 21C48 21 52 20 55 22C60 26 56 34 64 36C70 38 '+
        '78 37 84 37C88 37 92 37 94 40C97 43 96 48 96 52L96 81C100 81 103 '+
        '80 105 76C107 73 106 69 106 65L106 43C106 39 106 35 104 31C101 27 '+
        '96 27 92 27C84 27 76 27 68 27C68 22 68 17 65 14C61 10 55 11 50 11C39 '+
        '11 26 8 23 21M52 43C52 40 52 38 51 35C48 25 35 27 27 27C21 27 13 26 '+
        '9 32C6 37 7 43 7 48L7 82C7 87 6 94 10 97C15 101 22 100 28 100L69 '+
        '100C74 100 81 101 86 98C90 95 90 91 90 86L90 58C90 53 90 48 86 '+
        '45C83 43 79 43 75 43L52 43z" style="fill: #1976D2"></path>'+
        '<path d="M80 53C72 52 65 52 57 52C54 52 49 53 47 52C40 48 44 39 '+
        '38 37C34 36 21 35 18 39C16 42 17 45 17 48L17 69C17 74 15 85 18 '+
        '89C21 92 28 91 32 91L67 91C71 91 77 92 80 89C82 86 81 81 81 78C81 '+
        '70 81 61 80 53z" style="fill: #fff"></path></svg>'+
        '記事の編集・削除を表示'+
        '<style>'+
        '#el_button { position: absolute; top: 100px; left: calc(50% + 200px); '+
        'font: bold 16px Meiryo; white-space: nowrap; padding: 7px 20px 5px; '+
        'border-radius: 6px; color: #1976D2; background: #fff; '+
        'box-shadow: 5px 10px 30px #00000025; } '+
        '#el_button:hover { background: #cfd8dc; } '+
        '#el_button svg { width: 48px; height: 36px; vertical-align: -12px; } }'+
        '</style></div>';

    if(!document.querySelector('#el_button')){
        document.body.insertAdjacentHTML('beforeend', el_button); }


    let files_link=document.querySelector('#el_button');
    if(files_link){
        files_link.onclick=function(){
            location.href="https://blog.ameba.jp/ucs/entry/srventrylist.do"; }}

} // 下書き保存確認画面の場合
