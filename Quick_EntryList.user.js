// ==UserScript==
// @name        Quick EntryList
// @namespace        http://tampermonkey.net/
// @version        2.8
// @description        記事の編集・削除の機能拡張
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/entry/srventrylist*
// @match        https://blog.ameba.jp/ucs/entry/srventry*draft*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateinput.do*
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateend.do
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
        '#qe_panel button { font: 14px Meiryo; padding: 2px 6px 0; margin-right: 15px; } '+
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
    show_edit_open();



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



    function show_edit_open(){
        let action_link=document.querySelectorAll('.action a');
        for(let k=0; k<action_link.length; k++){
            action_link[k].addEventListener('click', function(event){
                if(event.shiftKey){
                    let sw=action_link[k].closest('.action');
                    if(sw){
                        sw.style.boxShadow='inset 0 0 0 16px #00cfb9'; }}}); }}



    let fuse=0; // 0:無効 1:有効 パネル複製機能の有効・無効のフラグ 🟢

    let copy_button=document.querySelectorAll('.actions .process[onclick*="copyEntry"]');
    let entry_title=document.querySelectorAll('input[name="disp_entry_title"]');
    for(let k=0; k<copy_button.length; k++){
        copy_button[k].onmouseup=(event)=>{
            if(event.ctrlKey){ //「複製」を「Ctrl+Click」でタイムスタンプをセット 🟠
                let li_item=copy_button[k].closest('.entry-item');
                let y_pos=li_item.getBoundingClientRect().top + window.scrollY - 45;
                panel_copy(y_pos, k); }
            else{
                let title=entry_title[k].value;
                title=title.substring(0, 10); // タイトルの先頭10文字
                sessionStorage.setItem('QE_copy', title); }

        }} // for()


    function panel_copy(y_pos, k){
        safe(1);
        fuse=1; // 🟢

        let copy_mode=localStorage.getItem('QE_Copy_mode'); // ローカルストレージ 保存名
        if(copy_mode==null){
            copy_mode=0; } // copy_mode「0」: Same ,「1」: Assign
        localStorage.setItem('QE_Copy_mode', copy_mode); // ローカルストレージ 保存

        let assign_date=localStorage.getItem('QE_Assign_date'); // ローカルストレージ 保存名
        if(assign_date==null){
            assign_date='202608051200'; } // 指定投稿日付の初期値
        localStorage.setItem('QE_Assign_date', assign_date); // ローカルストレージ 保存


        let panel=
            '<div class="date_in">'+
            '<button id="set0" type="button">'+
            '<span class="same">Same</span><span class="assign">Assign</span>'+
            '</button>　'+
            '<input id="set1" type="number" min="2000" max="2100" step="1"> 年 '+
            '<input id="set2" type="number" min="1" max="12" step="1"> 月 '+
            '<input id="set3" type="number" min="1" max="31" step="1" value="01"> 日　'+
            '<input id="set4" type="number" min="0" max="23" step="1" value="00">'+
            '：<input id="set5" type="number" min="0" max="59" step="1" value="00">　'+
            '<input id="set6" type="submit" value="✖">'+
            '<style>'+
            '.date_in { position: absolute; top: '+ y_pos +'px; '+
            'left: calc(50% - 420px); z-index: 100; padding: 6px 12px; color: #000; '+
            'font: normal 16px/22px Meiryo; background: #6bc1cf; border: 1px solid #aaa; } '+
            '#set0, #set1, #set2, #set3, #set4, #set5, #set6 { '+
            'font: 16px Meiryo; padding: 2px 2px 0 2px; text-align: center; } '+
            '#set0 { width: 64px; box-shadow: inset 0 0 0 80px #ffd54f; } '+
            '#set0 .same { display: none; } #set0 .assign { display: inline; } '+
            '#set0.same { box-shadow: inset 0 0 0 80px #add8df; } '+
            '#set0.same .same { display: inline; } #set0.same .assign { display: none; } '+
            '#set1 { width: 48px; } '+
            '#set2, #set3, #set4, #set5 { width: 28px; } '+
            '.date_in input[type="number"]::-webkit-inner-spin-button { '+
            ' -webkit-appearance: none; margin: 0; } '+
            '.date_in input[type="number"] { appearance: textfield; } '+
            '.date_in input[type="number"]:hover { outline: 2px solid #1976d2; } '+
            '#set6 { padding: 2px 2px 0; } '+
            '</style></div>';

        if(!document.querySelector('.date_in')){
            document.body.insertAdjacentHTML('beforeend', panel); }


        let post_time;

        let set0=document.querySelector('#set0');
        let set1=document.querySelector('#set1');
        let set2=document.querySelector('#set2');
        let set3=document.querySelector('#set3');
        let set4=document.querySelector('#set4');
        let set5=document.querySelector('#set5');
        let set6=document.querySelector('#set6');

        let nowPage=document.querySelector('input[name="nowPage"]');
        let page=nowPage.value;
        let urlParam=document.querySelector('input[name="urlParam"]');
        let param=urlParam.value;
        let entry_created_datetime=
            document.querySelectorAll('input[name="entry_created_datetime"]');
        let date=entry_created_datetime[k].value;


        if(set0){
            if(copy_mode==0){
                set0.classList.add('same');
                get_posted_time(param, date); }
            else{
                set0.classList.remove('same');
                get_assign_time(); }

            set0.onclick=()=>{
                if(copy_mode==0){
                    copy_mode=1;
                    set0.classList.remove('same');
                    get_assign_time(); }
                else{
                    copy_mode=0;
                    set0.classList.add('same');
                    get_posted_time(param, date); }

                localStorage.setItem('QE_Copy_mode', copy_mode); }} // ローカルストレージ 保存


        function get_posted_time(param, date){
            set1.value=param.substring(9, 13);
            set2.value=param.slice(-2);
            set3.value=date.substring(3, 5);
            set4.value=date.substring(7, 9);
            set5.value=date.substring(10, 12); }

        function get_assign_time(){
            assign_date=localStorage.getItem('QE_Assign_date');
            set1.value=assign_date.substring(0, 4);
            set2.value=assign_date.substring(4, 6);
            set3.value=assign_date.substring(6, 8);
            set4.value=assign_date.substring(8, 10);
            set5.value=assign_date.substring(10, 12); }

        function save_assign(){
            assign_date=set1.value + set2.value +set3.value + set4.value + set5.value;
            localStorage.setItem('QE_Assign_date', assign_date); }


        mouse_wheelset();

        set1.oninput=()=>{
            if(copy_mode==1){
                save_assign(); }}

        set2.oninput=()=>{
            set2.value=set2.value.padStart(2, '0');
            if(copy_mode==1){
                save_assign(); }}

        set3.oninput=()=>{
            set3.value=set3.value.padStart(2, '0');
            if(copy_mode==1){
                save_assign(); }}

        set4.oninput=()=>{
            set4.value=set4.value.padStart(2, '0');
            if(copy_mode==1){
                save_assign(); }}

        set5.oninput=()=>{
            set5.value=set5.value.padStart(2, '0');
            if(copy_mode==1){
                save_assign(); }}


        set6.onclick=()=>{
            document.querySelector('.date_in').remove();
            safe(0);
            fuse=0; // 🟢
            let sw=copy_button[k].closest('.action');
            if(sw){
                sw.style.boxShadow=''; }}


        if(document.querySelector('.date_in')){
            setTimeout(()=>{
                copy_button[k].disabled=false;
                let sw=copy_button[k].closest('.action');
                if(sw){
                    sw.style.boxShadow='inset 0 0 0 16px #b1dcff'; }

                copy_button[k].onmousedown=(event)=>{
                    if(fuse==1){ // 🟢
                        if(copy_mode==1){
                            page='1'; }
                        post_time='?pageID='+ page +'&entry_ym='+
                            set1.value + set2.value +'+'+
                            set2.value +'月'+ set3.value +'日 '+ set4.value +':'+ set5.value;

                        sessionStorage.setItem('QE_post', post_time);
                    }}}, 500); }

    } // panel_copy()


    function safe(n){
        let prosess_b=document.querySelectorAll('button.process');
        let prosess_a=document.querySelectorAll('a.process');
        if(n==1){
            for(let k=0; k<prosess_b.length; k++){
                prosess_b[k].disabled=true; }
            for(let k=0; k<prosess_a.length; k++){
                prosess_a[k].style.pointerEvents='none'; }}
        else{
            for(let k=0; k<prosess_b.length; k++){
                prosess_b[k].disabled=false; }
            for(let k=0; k<prosess_a.length; k++){
                prosess_a[k].style.pointerEvents=''; }}}


    function mouse_wheelset(){ // マウスホイールで設定可能にする
        let input=document.querySelectorAll('.date_in input[type="number"]');
        for(let k=0; k<input.length; k++){
            input[k].addEventListener('wheel', function(event){
                event.preventDefault(); // ページ全体のスクロールを防ぐ

                if(event.deltaY<0){ // deltaYが負なら上方向（増加）、正なら下方向（減少）
                    if(input[k].value/1<input[k].max/1){
                        input[k].stepUp(); }}
                else{
                    if(input[k].value/1>input[k].min/1){
                        input[k].stepDown(); }}

                input[k].value=input[k].value.padStart(2, '0');
                set_assign_date();

            }, { passive: false }); }


        function set_assign_date(){ // ホイール設定値をストレージに保存
            let copy_mode=localStorage.getItem('QE_Copy_mode');
            if(copy_mode==1){
                let assign_date='';
                let input=document.querySelectorAll('.date_in input[type="number"]');
                for(let k=0; k<input.length; k++){
                    assign_date+=input[k].value; }
                localStorage.setItem('QE_Assign_date', assign_date); }}

    } // mouse_wheelset()



    let qe_copy=sessionStorage.getItem('QE_copy');
    if(qe_copy){ // 複製操作で最新ページを開いた時に実行
        let title=sessionStorage.getItem('QE_copy');
        sessionStorage.removeItem('QE_copy'); // ストレージの複製フラグを削除

        let entry_title=document.querySelectorAll('input[name="disp_entry_title"]');
        let entry_id=document.querySelectorAll('input[name="entry_id"]');
        let entry_item=document.querySelectorAll('.entry-item');

        let index=newest_index();
        if(index!=-1 && entry_title[index].value.includes(title)){ // タイトルがコピー元と一致
            entry_item[index].style.outline='2px solid #2196f3'; // 複製した記事の青枠表示

            let dupe_id=entry_id[index].value;
            let post_time=sessionStorage.getItem('QE_post');
            if(post_time){ // 投稿日付を指定した複製の場合　再編集で開く
                let edit_url='/ucs/entry/srventryupdateinput.do?id='+ dupe_id;
                location.href=edit_url; }}} // if(qe_copy)
    else{
        let post_time=sessionStorage.getItem('QE_post');
        if(post_time){
            sessionStorage.removeItem('QE_post'); // 複製の post_timeフラグを削除（最終工程）
            let search=post_time.split('+')[0];
            search=search.substr(0, search.indexOf('ym=') + 9);

            let goto='https://blog.ameba.jp/ucs/entry/srventrylist.do'+ search;
            location.href=goto; } // post_time の複製指定先のリスト画面を開く


        let post_id=sessionStorage.getItem('QE_pid'); // 複製投稿の記事IDフラグがある場合
        if(post_id){
            setTimeout(()=>{
                let entry_id=document.querySelectorAll('input[name="entry_id"]');
                let entry_item=document.querySelectorAll('.entry-item');
                let index=newest_index();
                if(index!=-1 && entry_id[index].value==post_id){
                    entry_item[index].style.outline='2px solid #2196f3'; }

                sessionStorage.removeItem('QE_pid'); // 記事IDのフラグを削除
            }, 400); }} // else


    function newest_index(){ // IDの最新記事のindexを取得
        let entry_id=document.querySelectorAll('input[name="entry_id"]');
        let temp_id=0;
        let index=-1;
        for(let k=0; k<entry_id.length; k++){
            if(temp_id<entry_id[k].value/1){
                index=k;
                temp_id=entry_id[k].value; }}
        return index; }



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
                    qe_panel.style.display="none" }}}}


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

    let post_time=sessionStorage.getItem('QE_post');
    if(post_time){ // 複製作業で下書き投稿をした場合
        sessionStorage.removeItem('QE_post'); // タイムスタンプフラグを削除
        setTimeout(()=>{
            window.close(); // 確認画面を閉じる
        }, 100); }
    else{ //「記事の編集・削除を表示」ボタンを表示
        disp_el_button(); }


    function disp_el_button(){
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

    } // disp_el_button()

} // 下書き保存確認画面の場合




if(location.pathname.includes('srventryupdateinput.do')){ // 編集画面の場合（複製操作のみ）
    let post_time=sessionStorage.getItem('QE_post');
    if(post_time){

        let sleep=(ms)=> new Promise(resolve=> setTimeout(resolve, ms));

        async function runSequence(){
            await task1();
            await sleep(200); // 200ms待機
            await task2();
            await sleep(200);
            await task3();
            await sleep(200);
            await task4(); }

        runSequence();


        function task1(){
            let c_ym=post_time.split('ym=')[1].substring(0, 4) +'-'+post_time.split('ym=')[1].substring(4, 6)
            let c_day=post_time.split('月')[1].substring(0, 2);
            let c_time=post_time.split('日')[1].substring(0, 6);

            let new_post_time=c_ym +'-'+ c_day + c_time +':00';

            let entry_created_datetime=
                document.querySelector('input[name="entry_created_datetime"]');
            if(entry_created_datetime){
                entry_created_datetime.value=new_post_time; } // コピー元の投稿日時を設定

            // 2017-07-31 02:00:00


            let p_title=document.querySelector('input[name="entry_title"]');
            if(p_title){
                let title_tx=p_title.value;
                p_title.value=title_tx.replace('【複製】', '©'); } // 記事タイトル先頭に「©」を追加


            let entry_id=document.querySelector('input[name="entry_id"]');
            if(entry_id){
                let post_id=entry_id.value;
                sessionStorage.setItem('QE_pid', post_id); } // 投稿記事のIDを記録
        } // task1()


        function task2(){
            let publish_b1=document.querySelector('button.js-submitButton[publishflg="1"]');
            if(publish_b1){
                let mevent=new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true, });
                publish_b1.dispatchEvent(mevent); // SP Coutionの離脱防止をキャンセル
                publish_b1.click(); // 下書き保存
            }} // task2()


        function task3(){
            let prev_url=document.referrer;
            if(prev_url){
                window.open(prev_url, '_blank'); // 記事の編集・削除を別タブに開く
            }} // task3()


        function task4(){
            window.close();
        } // task4()

    } // if(post_time)

} // 編集画面の場合
