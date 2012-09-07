/**
 * 
 */ 

var MD = {
	canvas: null,
	/**
	 * 配置信息
	 */
	config: {
		canvasWidth: 6000,
		canvasHeight: 4000,
		topicMargin: 50
	},
	/**
	 * 模型
	 * @type {}
	 */
	model: {
		selected: [],
		topics: {
			root: {
				children:[]
			}
		}
	},
	/**
	 * 方法定义
	 */
	addFunction: function(fnName, fnBody){
		this[fnName] = fnBody;
	},
	/**
	 * 初始化
	 */
	init: function(){
		MD.canvas = $("#canvas");
		initCanvas();
		initTopicOperations();
		initHotKeys();
		/**
		 * 初始化画布
		 * @returns
		 */
		function initCanvas(){
			$(window).bind("resize.layout", function(){
				$("#canvas_container").height($(window).height() - 87);
			});
			$(window).trigger("resize.layout");
			MD.canvas.css({
				width: MD.config.canvasWidth + "px",
				height: MD.config.canvasHeight + "px"
			});
			$("#canvas_container").scrollTop((MD.config.canvasHeight - $("#canvas_container").height()) / 2);
			$("#canvas_container").scrollLeft((MD.config.canvasWidth - $("#canvas_container").width()) / 2);
			$("#central_topic").css({
				left: (MD.config.canvasWidth - $("#central_topic").outerWidth()) / 2,
				top: (MD.config.canvasHeight - $("#central_topic").outerHeight()) / 2
			});
		}
		/**
		 * 初始化主题操作
		 * @returns
		 */
		function initTopicOperations(){
			$(".tp_box").live("click", function(e){
				MD.unselect();
				MD.select($(this).attr("id"));
				e.stopPropagation();
			});
			MD.canvas.live("click", function(){
				MD.unselect();
			});
		}
		/**
		 * 初始化快捷键
		 * @returns
		 */
		function initHotKeys(){
			$(document).bind("keydown", function(e){
				var keyCode = e.which;
				//Insert，插入新主题
				if(keyCode == 45){
					MD.createTopic();
					//appendTopic();
				}
			});
		}
	}
};

/**
 * ##################添加设计器方法函数##############
 */

/**
 * 创建新的ID
 */
MD.addFunction("newId", function(){
	var random = Math.random();
	var newId = (random + new Date().getTime());
	return newId.toString(16).replace(".", "");
});

/**
 * 选中形状
 */
MD.addFunction("select", function(topicIds){
	//如果是字符串，则为选择一个
	if(typeof topicIds == "string"){
		var topicId = topicIds;
		topicIds = [];
		topicIds.push(topicId);
	}
	if(topicIds.length <= 0){
		return;
	}
	for (var index = 0; index < topicIds.length; index++) {
		var topicId = topicIds[index];
		$("#" + topicId).addClass("tp_box_selected");
		MD.model.selected.push(topicId);
	}
});

/**
 * 取消选择
 */
MD.addFunction("unselect", function(){
	$(".tp_box_selected").removeClass("tp_box_selected");
	MD.model.selected = [];
});

/**
 * 获取选中图形的ID数组
 * @return {}
 */
MD.addFunction("getSelect", function(){
	return MD.model.selected;
});

/**
 * 获取主主题
 * @param {} position 是获取左边的还是右边的, right left, 无此参数获取全部的
 * @return {}
 */
MD.addFunction("getMainTopics", function(position){
	var result = [];
	var topics = MD.model.topics;
	var mainIds = topics.root.children;
	for(var i = 0; i < mainIds.length; i++){
		var tp = topics[mainIds[i]];
		if(!position){
			result.push(tp);
		}else if(position == "left" && tp.pos.x < 0){
			result.push(tp);
		}else if(position == "right" && tp.pos.x >= 0){
			result.push(tp);
		}
	}
	return result;
});
/**
 * 通过ID获取主主题
 * @param {} topicId
 * @return {}
 */
MD.addFunction("getTopic", function(topicId){
	return MD.model.topics[topicId];
});
/**
 * 获取主题的容器元素
 * @param {} topicId
 * @return {}
 */
MD.addFunction("getContainer", function(topicId){
	return $("#" + topicId).parent();
});
/**
 * 获取树形主题结构的的根元素
 * @param {} topicId
 */
MD.addFunction("getTreeRoot", function(topicId){
	var topics = MD.model.topics;
	while(topicId != "root"){
		var parentId = topics[topicId].parent;
		if(parentId == "root"){
			return topics[topicId];
		}else{
			topicId = parentId;
		}
	}
	return null;
});
/**
 * 创建图形
 */
MD.addFunction("createTopic", function(){
	var selected = MD.getSelect();
	var parentId;
	var title;
	if(selected.length == 0){
		parentId = "root";
	}else{
		parentId = selected[selected.length - 1];
	}
	if(parentId == "root"){
		title = "分支主题";
	}else{
		title = "子主题";
	}
	var newId = MD.newId();
	var topic = {
		id: newId,
		title: title,
		pos: null,
		parent: parentId
	};
	MD.renderTopic(topic);
	var topics = MD.model.topics;
	topics[topic.id] = topic;
	var parentId = topic.parent;
	if(!topics[parentId].children){
		topics[parentId].children = [];
	}
	topics[parentId].children.push(topic.id);
	MD.unselect();
	MD.select(topic.id);
});
/**
 * 创建图形
 */
MD.addFunction("updateTopic", function(topic){
	//重新绘制
	MD.renderTopic(topic);
});
/**
 * 创建图形
 */
MD.addFunction("renderTopic", function(topic){
	var center = {
		x: MD.config.canvasWidth / 2,
		y: MD.config.canvasHeight / 2
	};
	//获取主题的DOM
	//判断主题DOM是否存在，否则添加主题DOM
	var topicDom = MD.getContainer(topic.id);
	if(topicDom.length == 0){
		var topicHtml = "<div class='tp_container'><div id='" + topic.id + "' class='tp_box'><div class='topic'>" + topic.title + "</div></div></div>";
		var appendTarget;
		//确定要往哪个元素里添加
		if(topic.parent == "root"){
			appendTarget = MD.canvas;
		}else{
			var mainTopic = MD.getTreeRoot(topic.parent);
			//如果是子主题，容器为父主题的tp_children元素
			var appendTarget = $("#" + topic.parent).siblings(".tp_children");
			//如果没有tp_children元素，创建
			if(appendTarget.length == 0){
				if(mainTopic.pos.x < 0){
					appendTarget = $("<div class='tp_children'></div>").prependTo(MD.getContainer(topic.parent));
				}else{
					appendTarget = $("<div class='tp_children'></div>").appendTo(MD.getContainer(topic.parent));
				}
			}
		}
		topicDom = $(topicHtml).appendTo(appendTarget);
	}
	var mainTopic;
	if(topic.parent == "root"){
		mainTopic = topic;
		topicDom.css("position", "absolute");
	}else{
		mainTopic = MD.getTreeRoot(topic.parent);
	}
	if(topic.parent == "root" && topic.pos == null){
		//定位放置主题
		MD.placeTopic(topic);
	}
	var mainContainer = MD.getContainer(mainTopic.id);
	mainContainer.css("top", center.y + mainTopic.pos.y - mainContainer.height()/2);
	if(mainTopic.pos.x < 0){
		var box = $("#" + mainTopic.id);
		mainContainer.css("left", center.x + mainTopic.pos.x + box.outerWidth() - mainContainer.width());
	}else{
		mainContainer.css("left", center.x + mainTopic.pos.x);
	}
	drawLinker(mainTopic, mainContainer);
	/**
	 * 绘制连接线
	 */
	function drawLinker(topic, container){
		var center = {
			x: MD.config.canvasWidth / 2,
			y: MD.config.canvasHeight / 2
		};
		var pos = topic.pos;
		var linker = {};
		if(pos.x > 0){
			linker.x = 0;
			linker.w = Math.abs(pos.x) + 2;
		}else{
			var topicW = container.children(".tp_box").outerWidth();
			linker.x = pos.x + topicW - 2;
			linker.w = Math.abs(pos.x + topicW);
		}
		//因为边缘绘制问题，画布实际大出10像素
		linker.h = Math.abs(pos.y);
		//确定连接线画布的y坐标，和绘制路径中起点和终点的y坐标
		var path = {};
		if(pos.y > 0){
			linker.y = 0;
			if(pos.x > 0){
				path.y1 = 0;
				path.y2 = linker.h;
			}else{
				path.y1 = linker.h;
				path.y2 = 0;
			}
		}else{
			linker.y = pos.y;
			if(pos.x > 0){
				path.y1 = linker.h;
				path.y2 = 0;
			}else{
				path.y1 = 0;
				path.y2 = linker.h;
			}
		}
		var linkerDom = $("#tp_linker_" + topic.id);
		if(linkerDom.length == 0){
			linkerDom = $("<canvas id='tp_linker_" + topic.id + "' class='linker_canvas'></canvas>").appendTo(MD.canvas);
		}
		linkerDom.attr({
			width: linker.w + 10,
			height: linker.h + 10
		});
		linkerDom.css({
			left: center.x + linker.x - 5,
			top: center.y + linker.y - 5
		});
		var linkerCanvas = linkerDom[0];
		if($.browser.msie){
		    linkerCanvas = window.G_vmlCanvasManager.initElement(linkerCanvas);
		}
		var ctx = linkerCanvas.getContext("2d");
		ctx.strokeStyle = "#c9c9c9";
		ctx.lineWidth = 2;
		ctx.lineCap = "square";
		ctx.translate(5, 5);
		ctx.beginPath();
		ctx.moveTo(0, path.y1);
		if(pos.x > 0){
			ctx.bezierCurveTo(0, linker.h / 2, linker.w / 2, path.y2, linker.w, path.y2);
		}else{
			ctx.bezierCurveTo(linker.w / 2, path.y1, linker.w, linker.h / 2, linker.w, path.y2);
		}
		ctx.stroke();
		
		//Draw a circle at the end.
//			ctx.beginPath();
//			ctx.lineWidth = 1;
//			ctx.fillStyle = "#FFFFFF";
//			ctx.strokeStyle = "#555555";
//			ctx.arc(linker.w, path.y2, 2, 0, Math.PI * 2, false);
//			ctx.stroke();
//			ctx.fill();
	}
});
/**
 * 放置主题
 */
MD.addFunction("placeTopic", function(tp){
	var leftTopics = MD.getMainTopics("left");
	var leftCount = leftTopics.length;
	var rightTopics = MD.getMainTopics("right");
	var rightCount = rightTopics.length;
	var container = MD.getContainer(tp.id);
	var pos = {x: 0, y : 0};
	var bh = container.height()/2;
	var central = $("#central_topic");
	var topicsToRange;
	if(leftCount > 0 || rightCount >= 3){
		pos.x = 0 - central.width() / 2 - 40 - container.width();
		topicsToRange = leftTopics;
	}else{
		pos.x = central.width() / 2 + 40;
		topicsToRange = rightTopics;
	}
	if(topicsToRange.length == 0){
		pos.y = -100;
	}else if(topicsToRange.length == 1){
		//当目前有一个主题时
		var tp1 = topicsToRange[0];
		if(tp1.pos.y + MD.getContainer(tp1.id).height()/2 > 100 - bh - MD.config.topicMargin){
			pos.y = tp1.pos.y + MD.getContainer(tp1.id).height()/2 + bh + MD.config.topicMargin;
		}else{
			pos.y = 100;
		}
	}else if(topicsToRange.length == 2){
		//当目前有两个主题
		var tp1 = topicsToRange[0];
		var tp2 = topicsToRange[1];
		var tp1Half = MD.getContainer(tp1.id).height()/2;
		var tp2Half = MD.getContainer(tp2.id).height()/2;
		//先修改第二个主题，如果可以，放到右边正中间
		if(tp1.pos.y + tp1Half > 0 - tp2Half - MD.config.topicMargin){
			tp2.pos.y = tp1.pos.y + MD.config.topicMargin + tp1Half + tp2Half
		}else{
			tp2.pos.y = 0;
		}
		//更新第二个主题
		MD.updateTopic(tp2);
		//再设置新创建的主题
		if(tp2.pos.y + tp2Half > 100 - bh - MD.config.topicMargin){
			pos.y = tp2.pos.y + tp2Half + bh + MD.config.topicMargin;
		}else{
			pos.y = 100;
		}
	}else{
		
	}
	tp.pos = pos;
});
/**
 * 排列主题
 */
MD.addFunction("rangeTopics", function(position, topic){
	if(topic){
		
	}
});

$(function(){
	MD.init();
});