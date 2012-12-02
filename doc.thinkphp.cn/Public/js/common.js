$(function(){	
	var __GET_USERINFO__ = '/Edit/Index/getUserInfo';
	//获取用户信息
	$.get(__GET_USERINFO__, {
		'menu'    : $('.book-title[menu]').attr('menu'),
		'book'    : $('.book-logo a[book]').attr('book')
	}, function(data){
		var userinfo = data.data;
		if(userinfo.uid && userinfo.username){
			$('.user-current').append('<span>欢迎您，' + userinfo.username + '</span>');
			if(userinfo.iseditor || userinfo.isadmin){
				var set = $('<a class="set fr" href="javascript:void(0)" title=""></a>');
				if(/.*?\/_edit\/.*?/.test( document.location.href)){
					set.attr('title', '浏览模式')
					    .html('浏览模式<i>&nbsp;</i>')
					    .click(function(){
							document.location = '/'+ userinfo.book +'/'+ $('.book-title[menu]').attr('menu');
						});	
				}else{
					set.attr('title', '编辑模式')
					    .html('编辑模式<i>&nbsp;</i>')
					    .click(function(){
							document.location = '/_edit/'+ userinfo.book +'/'+ $('.book-title[menu]').attr('menu');
						});		
				}
				$('.book-tool .content').append(set);
			}
		} else {
			$('.user-current').append('<span>ThinkPHP3.0在线手册，<a target="_blank" href="http://www.thinkphp.cn/member-login.html">[现在登陆]</a></span>');	
		}
	}, 'json');
	
	//搜索框
	$('.book-tool .search input:text').focus(function(){
		$('.book-tool .search label').hide();
	})
	$('.book-tool .search input:text').blur(function(){
		if($(this).val() == '')
			$('.book-tool .search label').show();
	})
	
	//表格隔行变色
	$('table').TableColor();
	
	//代码高亮
	$('pre.code').each(function(){
		var self = $(this).addClass('prettycode').removeClass('code');
		self.html(prettyPrintOne(self.html(), self.attr('lang'), true));
	});
	
	//工具栏
	$('.book-tool .next').click(function(){
		var index = $('.book-menu a.selected').index('.book-menu a');
		var href  = $('.book-menu a').eq(index + 1).attr('href');
		if(href === undefined) href = $('.book-menu a').eq(0).attr('href');
		window.document.location = href;
		return false;
	});
	
	$('.book-tool .prev').click(function(){
		var index = $('.book-menu a.selected').index('.book-menu a');
		window.document.location = $('.book-menu a').eq(index - 1).attr('href');
		return false;
	});
	
	//快捷键支持
	if(typeof noKeys == 'undefined'){
		$(document).keydown(function(e){
			switch(e.keyCode){
				case 37:
					$('.book-tool .prev').click();
					break;
				case 39:
					$('.book-tool .next').click();
					break;	
			}
		});
	}
	
});

//表格隔行变色插件
(function($){
	$.fn.TableColor = function(){
		return $(this).each(function(){
			if(this.nodeName.toLowerCase() != 'table') return;
			var self = $(this);
			self.find('tr').each(function(index) {
                var _this = $(this);
				if(index % 2 == 0){
					_this.addClass('add');
				} else {
					_this.addClass('even');	
				}
				_this.hover(
					function(){_this.addClass('hover')},
					function(){_this.removeClass('hover')}
				);
            });	
		});
	}	
})(jQuery)