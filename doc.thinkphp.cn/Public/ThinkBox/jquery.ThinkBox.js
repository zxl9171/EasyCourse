/* jQuery.fn.ThinkBox */
(function(jQuery){
	jQuery.fn.extend({
		ThinkBox:function(opt){
			var options = {
				fixed : false,
				center: false,
				modal : false,
				drag  : false
			};
			return this.each(function() {
				var node = this.nodeName.toLowerCase(), _this = jQuery(this);
				if(node == 'a'){
					_this.click(function(){
						if(_this.isDisplay) return false;
						var position = _this.offset()
						var type  = _this.attr('think-box');
						if(type == 'url'){
							var offset = _this.offset();
							options = jQuery.extend(
								{},
								options,
								{
									ele: _this,
									x:offset.left,
									y: _this.outerHeight() + offset.top,
									cacheEle: this,
									_beforeShow: function(){_this.isDisplay = true},
									_afterHide: function(){_this.isDisplay = false}
								} ,
								opt || {}
							);
							jQuery.ThinkBox.load(_this.attr('href'), options);
						}
						return false;
					});
				} // ELSE
			});
		}
	})
})(jQuery);

/* jQuery.ThinkBox */
jQuery.ThinkBox = {
	// 以一个URL加载内容并以ThinBox对话框的形式展现
	load: function(url, opt){
        var options = {type: 'GET', dataType: 'text', cache: false, cacheEle: 'body', content: '<div class="ThinkBox-loading"></div>'};
		options = jQuery.extend({}, options, opt || {});
		options.show = false; //创建空弹出框但不显示
		var box = new ThinkBox("", options)

		if(options.cache && jQuery(options.cacheEle).data('ThinkBox-data')){
			var data = jQuery(options.cacheEle).data('ThinkBox-data'); //读取缓存数据
			_ThinkBox(data);
		} else {
			var ajax = {
				url     : url,
				type    : options.type,
				dataType: options.dataType,
				cache   : options.cache,
				success : function(data) {
					if(options.cache) jQuery(options.cacheEle).data('ThinkBox-data', data); //缓存数据
					_ThinkBox(data);
				}
			};
        	jQuery.ajax(ajax);
		}
		return box;

		/* 设置ThinkBox内容 */
		function _ThinkBox(data){
			if(options.dataType == 'json'){
				data = options['parse'](data, options.ele);
			} else if(options.dataType == 'text' && options.filter){
				data = jQuery(options.filter, data);
			}

			//删除ThinkBox不需要的参数
			jQuery.each(['type', 'cache', 'cacheEle', 'dataType', 'parse'], function() {
				if (this in options) delete options[this];
			});

			//设置内容并显示弹出框
			box.setContent(data).setLocate().show();
		}
    },

	// 获取包含元素的实例
	get: function(element) {
        var p = jQuery(element).parents('.ThinkBox-wrapper');
        return p.length ? jQuery.data(p[0], 'ThinkBox') : null;
    },

	// 弹出一个iframe
	iframe: function(url, opt){
		var options = {width: 500, height: 400, scrolling:'no'};
		options = jQuery.extend({}, options, opt || {});
		var html = '<iframe src="' + url + '" width="' + options.width + '" height="' + options.height + '" frameborder="0" scrolling="' + options.scrolling + '"></iframe>';
		delete options.width, delete options.height, delete options.scrolling; //删除不必要的信息
		return new ThinkBox(html, options);
	},

	// 提示框
	tips:function(msg, type, opt){
		var html = '<div class="ThinkBox-tips ThinkBox-' + type + '">' + msg + '</div>';
		var options = {modalClose:false, escHide:false, closeBtn:false, timeOutClose: 1000};
		options = jQuery.extend({}, options, opt || {});
		return new ThinkBox(html, options)	;
	},

	// 成功提示框
	success: function(msg, opt){
		return this.tips(msg, 'success', opt);
	},

	// 成功提示框
	error: function(msg, opt){
		return this.tips(msg, 'error', opt);
	},
    
    confirm: function(msg,opt){
        //创建确认窗体
        var html = jQuery('<div>'+
                        '<div class="ThinkBox_msg">' + msg + '</div>'+
                            '<div class="tac mt10 mb20">'+
                                '<a class="ThinkBox_ok button1 mr15" href="javascript:void(0);" title="确定"><span>确定</span></a>'+
                                '<a class="ThinkBox_cancel button1 ml15" href="javascript:void(0);" title="取消"><span>取消</span></a>'+
                            '</div>'+
                     '</div>');
        //取消按钮         
        var cancel = html.find('.ThinkBox_cancel') ;
        //参数
        var options = {
            'title':'提示',
            'modalClose':false,
            'ok': function(){},
            'cancel': function(){},
            'closeBtn':false
        };
		options = jQuery.extend({}, options, opt || {});
        //确认按钮
		html.find('.ThinkBox_ok').click(function(){
           if(jQuery.isFunction(options.ok)){
               options.ok();
           }
           jQuery.ThinkBox.get(this).hide();
        });
        //取消按钮
        cancel.click(function(){
            if(jQuery.isFunction(options.cancel)){
               options.cancel();
            }
            jQuery.ThinkBox.get(this).hide();
        });
        new ThinkBox(html, options);
    }
};

/* ThinkBox class */
var ThinkBox = function(element, options){
	this.options = $.extend({}, ThinkBox.defaults, options || {});
	if(this.options.dataEle && $(this.options.dataEle).data('ThinkBoxData')) 
		$(this.options.dataEle).data('ThinkBoxData').box.remove();
	this.box = $(ThinkBox.wrapper).addClass(this.options.style).css({"width": this.options.width, "height": this.options.height}); // 设置弹出框容器及设定皮肤样式
	$.data(this.box[0], 'ThinkBox', this); //缓存弹出框
	this.visible = false; //是否隐藏
	this.setContent(element || "<div></div>"); //设置内容
	this._setupTitleBar(); // 安装标题栏
	this._setupCloseBut(); // 安装关闭按钮
	this.box.css('display', 'none').appendTo(document.body); //放入body

	//设置弹出框fixed属性
	if (this.options.fixed) {
        if (jQuery.browser.msie && jQuery.browser.version < 7) {
            this.options.fixed = false; // IE6 不支持fixed属性
        } else {
            this.box.addClass('fixed');
        }
    }

	//设置弹出框显示位置
	this.setLocate();
	if(this.options.resize){
		var _this = this;
		jQuery(window).resize(function(){_this.setLocate()});
	}
	
	//缓存弹出框防止同时弹出多个
	if(this.options.dataEle) $(this.options.dataEle).data('ThinkBoxData', this);
	//是否立即显示弹出框
	if(this.options.show) this.show();
};

jQuery.extend(ThinkBox,{
	//默认配置参数
	defaults: {
		title       : null,  // 弹出框标题
		fixed       : false,  // 是否使用固定定位(fixed)而不是绝对定位(absolute)，固定定位的对话框不受浏览器滚动条影响。IE6不支持固定定位，其永远表现为绝对定位。
		center      : true,  // 对话框是否屏幕中心显示
		modal       : true, // 对话框是否设置为模态。模态时，浏览器背景"黑黑的"，阻止页面的其他元素接受事件。
		resize      : true,  // 是否在窗口大小改变时重新定位弹出框位置
		beforeShow  : function(){}, //显示前的回调方法
		afterShow   : function(){}, //显示后的回调方法
		afterHide   : function(){}, //隐藏后的回调方法
		beforeUnload: function(){}, //卸载前的回调方法
		afterDrop   : function(){}, //拖动停止后的回调方法
		titleNav    : function(){}, //带选项卡标题栏点击事件
		unloadOnHide: true,  // 隐藏后是否卸载
		modalClose  : true,  // 点击模态背景是否关闭弹出框
		closeBtn    : true,  // 点击模态背景是否关闭弹出框
		escHide     : false,  // 按ESC是否关闭弹出框
		timeOutClose: 0,     // 延时自动关闭弹出框 0表示不自动关闭
		drag        : true,  // 点击标题框是否允许拖动
		show        : true,   // 是否在创建后立即显示
		width       : '',     //弹出框内容区域宽度   空表示自适应
		height      : '',     //弹出框内容区域高度   空表示自适应
		dataEle     : '',  // 弹出框缓存元素，设置此属性的弹出框只允许同时存在一个 
		style       : 'default' //弹出框样式
	},

	// 弹出框容器
	wrapper: '<div class="ThinkBox-wrapper"><table cellspacing="0" cellpadding="0" border="0"><tr><td class="box-top-left"></td><td class="box-top"></td><td class="box-top-right"></td></tr><tr><td class="box-left"></td><td class="ThinkBox-inner"></td><td class="box-right"></td></tr><tr><td class="box-bottom-left"></td><td class="box-bottom"></td><td class="box-bottom-right"></td></tr></table></div>',

	// 标题栏
	titlebar: '<tr class="ThinkBox-title"><td class="box-title-left"></td><td class="ThinkBox-title-inner"></td><td class="box-title-right"></td></tr>',

	// 弹出框Z轴高度
	zIndex : 19881101,

	//是否绑定了调整模态背景事件
	resizeModal: false,

	//拖动参数
	dragging: null,

	// 获取下一个Z轴高度
	_nextZ: function() {
        return this.zIndex++;
    },

	// 判断指定的变量是否都存在
	_u: function() {
		var len = arguments.length;
        for (var i = 0; i < len; i++)
            if (typeof arguments[i] != 'undefined') return false;
        return true;
    },

	// 调整模态背景大小
	_resizeModal: function(evt) {
        var d = jQuery(document);
        jQuery('.ThinkBox-modal-blackout').css('display', 'none').css({width: d.width(), height: d.height()}).css('display', 'block');
    },

	// 获取浏览器可视区域的大小
	_viewport: function() {
        var d = document.documentElement, b = document.body, w = window;
        return jQuery.extend(
            jQuery.browser.msie ? {left: b.scrollLeft || d.scrollLeft, top: b.scrollTop || d.scrollTop} : {left: w.pageXOffset, top: w.pageYOffset},
            !ThinkBox._u(w.innerWidth) ? {width: w.innerWidth, height: w.innerHeight} : (!ThinkBox._u(d) && !ThinkBox._u(d.clientWidth) && d.clientWidth != 0 ? {width: d.clientWidth, height: d.clientHeight} : {width: b.clientWidth, height: b.clientHeight})
		);
    }
});

ThinkBox.prototype = {
	// 获取弹出框容器对象
	getInner: function() {
        return jQuery('.ThinkBox-inner', this.box);
    },

	// 获取弹出框内容对象
	getContent: function() {
        return jQuery('.ThinkBox-content', this.box);
    },

	// 设置弹出框内容
	setContent: function(newContent) {
        newContent = jQuery(newContent).css({display: 'block'}).addClass('ThinkBox-content');
        this.getContent().remove(); // 卸载原容器中的内容
        this.getInner().append(newContent); // 添加新内容
        return this;
    },

	// 调整Z轴到最上层
	toTop: function() {
        this.box.css({zIndex: ThinkBox._nextZ()});
        return this;
    },

	// 显示弹出框
	show: function() {
        if (this.visible) return this;
		var _this = this;

		// 显示模态背景
        if (this.options.modal) {
            if (!ThinkBox.resizeModal) {
                ThinkBox.resizeModal = true;
                jQuery(window).resize(function(){ThinkBox._resizeModal()});
            }
            this.modalBlackout = jQuery('<div class="ThinkBox-modal-blackout"></div>').addClass('ThinkBox-' + this.options.style).css({zIndex: ThinkBox._nextZ(), opacity: 0.5, width: jQuery(document).width(), height: jQuery(document).height()}).appendTo(document.body);

			// 点击模态背景关闭弹出框
			if(this.options.modalClose){
				this.modalBlackout.click(function(){
					_this.hide();
				});
			}
		}

		// 按ESC键关闭弹出框
		if (this.options.escHide) {
            jQuery(document.body).bind('keypress.box', function(evt){
                var key = evt.which || evt.keyCode;
                if (key == 27) _this.hide();
            });
        }

		// 延时自动关闭弹出框
		if(this.options.timeOutClose){
			this.timeClose(this.options.timeOutClose);
		}

		this.toTop(); //调整到z轴最上层
		this._fire('beforeShow'); //显示之前回调函数
        this.box.stop().fadeIn('fast', function(){_this._fire('afterShow')});
        this.visible = true;
        return this;
    },

	// 隐藏弹出框
	hide: function() {
        if (!this.visible) return;
        var _this = this;
		if(this.options.escHide) jQuery(document.body).unbind('keypress.box');
        if(this.options.modal) {
            this.modalBlackout.animate({opacity: 0}, function() {
                jQuery(this).remove();
            });
        }
        this.box.stop().animate({opacity: 0}, 300, function() {
            _this.box.css({display: 'none'});
            _this.visible = false;
            _this._fire('afterHide'); //隐藏后的回调方法
            if(_this.options.unloadOnHide) _this.unload();
        });
		return this;
    },

	// 移动弹出框到屏幕中央
	center: function(axis) {
        var v = ThinkBox._viewport();
        var o = this.options.fixed ? [0, 0] : [v.left, v.top];
        if (!axis || axis == 'x') this.moveCenterTo(o[0] + v.width / 2, null);
        if (!axis || axis == 'y') this.moveCenterTo(null, o[1] + v.height / 2);
        return this;
    },

	// 移动弹出框的中心到指定的坐标
	moveCenterTo: function(x, y) {
        var s = this[this.visible ? 'getSize' : 'estimateSize']();
        if (typeof x == 'number') this.moveToX(x - s[0] / 2);
        if (typeof y == 'number') this.moveToY(y - s[1] / 2);
        return this;
    },

	// 移动弹出框的左上角到指定的坐标
    moveTo: function(x, y) {
        this.moveToX(x).moveToY(y);
        return this;
    },

    // 移动弹出框的左上角到指定的X坐标
    moveToX: function(x) {
        if(typeof x == 'number') this.box.css({left: x});
        return this;
    },

    // 移动弹出框的左上角到指定的Y坐标
    moveToY: function(y) {
        if (typeof y == 'number') this.box.css({top: y});
        return this;
    },

	// 弹出框隐藏时获取大小
	estimateSize: function() {
        this.box.css({visibility: 'hidden', display: 'block'});
        var dims = this.getSize();
        this.box.css('display', 'none').css('visibility', 'visible');
        return dims;
    },

    // 弹出框显示时获取大小
    getSize: function() {
        return [this.box.width(), this.box.height()];
    },

	// 设置弹出框位置
	setLocate: function(){
		if (this.options.center) {
			this.center();
		} else {
			this.moveTo(
				ThinkBox._u(this.options.x) ? 0 : this.options.x,
				ThinkBox._u(this.options.y) ? 0 : this.options.y
			);
		}
		return this;
	},

	// 卸载弹出框
	unload: function() {
        this._fire('beforeUnload'); //卸载前的回调方法
        this.box.remove();
    },

	// 根据指定的时间关闭弹出框
	timeClose: function(time){
		if(typeof time == 'number' && 0 < time){
			var _this = this;
			setTimeout(function(){_this.hide()}, time);
		}
	},

	// 安装标题栏
	_setupTitleBar: function() {
        if (this.options.title !== null) {
            var _this = this;
            var titleBar = jQuery(ThinkBox.titlebar);
			var titleCont = titleBar.find('.ThinkBox-title-inner');
			if(typeof this.options.title === 'string'){
				titleCont.append('<span>' + this.options.title + '</span>');	
			} else {
				$.each(this.options.title, function(i, title){
					$('<span>' + title + '</span>')
						.addClass('nav')
						.click(function(event){
							if(!$(this).hasClass('selected')){
								titleCont.find('span.selected').removeClass('selected');
								$(this).addClass('selected');
								_this._fire('titleNav', i);
							}
						})
						.mousedown(function(event){event.stopPropagation()})
						.mouseup(function(event){event.stopPropagation()})
						.appendTo(titleCont);
				});
				titleCont.find('.nav').eq(0).addClass('selected');
			}
            if (this.options.drag) {
				titleCont.addClass('dragging');
                titleCont[0].onselectstart = function() {return false}; //禁止选中文字
                titleCont[0].unselectable = 'on'; // 禁止获取焦点
                titleCont[0].style.MozUserSelect = 'none'; // 禁止火狐选中文字
                jQuery(document).mousemove(function(evt){
					var d;
					if(d = ThinkBox.dragging) {
						d[0].box.css({left: evt.pageX - d[1], top: evt.pageY - d[2]});
					}
				});
                titleCont.mousedown(function(evt) {
                    _this.toTop();
                    ThinkBox.dragging = [_this, evt.pageX - _this.box[0].offsetLeft, evt.pageY - _this.box[0].offsetTop];
                }).mouseup(function() {
                    ThinkBox.dragging = null;
                    _this._fire('afterDrop'); //拖动后的回调函数
                });
            }
            this.box.find('tr').first().after(titleBar);
        }
    },

	// 安装关闭按钮
	_setupCloseBut: function(){
		if(this.options.closeBtn){
			this.box.find('.ThinkBox-inner').append('<a class="ThinkBox-close"></a>');
			var _this = this;
			jQuery('.ThinkBox-close', this.box)
			.click(function(){_this.hide()})
			.mousedown(function(event){event.stopPropagation()});
		}
	},

	//调用回调函数
	_fire: function(event,arg) {
		this.options["_" + event] && this.options["_" + event](this);
        this.options[event](this, arg);
    }
};