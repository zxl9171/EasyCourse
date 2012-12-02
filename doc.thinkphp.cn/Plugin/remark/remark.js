function remark(){
	var __GET_REMARK_COUNT__ = '/Plugin/remarkGetCount';
	var __GET_REMARK__       = '/Plugin/remarkGetList';
	var __ADD_REMARK__       = '/Plugin/remarkAdd';
	
	//初始化评注
	$('.book-content').append('<div class="book-remark"><span></span></div>');
	var content_id = [];
	$('.book-content').each(function(){
		content_id.push(this.id);
	});
	content_id = content_id.join(',');
	//获取评注总数
	$.post(__GET_REMARK_COUNT__, {'id':content_id}, function(data){
		if(data.status){
			$.each(data.data,function(id,num){
				$('#'+id).find('.book-remark span').addClass('num').html(num);	
			});
		}
	}, 'json');
	$('.book-remark').click(function(){
		var edit_content = $(this).parent();
		var remark_content_id = edit_content.attr('id');
		var selfNum = $(this).find('span');
		$.ThinkBox.load(
			__GET_REMARK__ + '?id=' + remark_content_id,
			{
				'title': ['查看评注','添加评注'],
				'modal': false,
				'titleNav':function(box,i){
					box.getContent().find('div').hide().eq(i).show();
				},
				'beforeShow': function(box){
					box.getContent().find('textarea').keydown(function(event){event.stopPropagation();});
					box.getContent().find('input').click(function(){
						var textarea = box.getContent().find('textarea');
						var content = $.trim(textarea.val());
						if(content){
							$.post(__ADD_REMARK__, {
									'content_id':remark_content_id,
									'menu_id'   : $('.book-title[menu]').attr('menu'),
									'book_id'   : $('.book-logo a[book]').attr('book'),
									'content'   : content
								},function(data){
								if(data.status){
									var number = selfNum.html();
									if(number){
										selfNum.html(parseInt(number) + 1)
									} else {
										selfNum.html(1).addClass('num');
									}
									$.ThinkBox.success(data.info);
									box.hide();	
								}else{
									$.ThinkBox.error(data.info);	
								}
							}, 'json')
						}else{
							$.ThinkBox.error('评注类容不能为空！');
							textarea.focus();
						}
					});
					edit_content.addClass('remarking');
				},
				'afterHide': function(){edit_content.removeClass('remarking');}
			}
		);
	});
}