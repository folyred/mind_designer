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
		canvasHeight: 4000
	},
	/**
	 * 模型
	 * @type {}
	 */
	model: {
		selected: [],
		topics: []
	},
	/**
	 * 工具
	 */
	util: {
		newId: function(c1, c2){
			var random = Math.random();
			var newId = (random + new Date().getTime());
			return newId.toString(16).replace(".", "");
		},
		/**
		 * 选中形状
		 */
		select: function(topicIds){
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
		},
		/**
		 * 取消选择
		 */
		unselect: function(){
			$(".tp_box_selected").removeClass("tp_box_selected");
			MD.model.selected = [];
		}
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
				MD.util.unselect();
				MD.util.select($(this).attr("id"));
				e.stopPropagation();
			});
			MD.canvas.live("click", function(){
				MD.util.unselect();
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
					appendTopic("root");
				}
			});
		}
		/**
		 * 
		 */
		function appendTopic(parentId){
			var bounding;
			var newId = MD.util.newId();
			if(parentId == "root"){
				bounding = $("<div class='tp_bounding'><div id='"+newId+"' class='tp_box'><div class='topic'>Main Topic</div></div></div>").appendTo(MD.canvas);
			}
			var pos = rangeTopics(bounding);
			MD.model.topics.push({
				id: newId,
				title: "Main Topic",
				pos: pos,
				parent: parentId
			});
			return;
			
			
			
			
			var center = {
				x: MD.config.canvasWidth / 2,
				y: MD.config.canvasHeight / 2
			};
			var central = $("#central_topic");
			var centralWidthHalf = central.outerWidth()/2;
			var basicPos = [
				{
					//右上
					x: centralWidthHalf + 80,
					y: - 100,
					exists: false
				},{
					//右下
					x: centralWidthHalf + 80,
					y: 100,
					exists: false
				},{
					//右
					x: centralWidthHalf + 80,
					y: 0,
					exists: false
				},{
					//左上
					x: 0 - centralWidthHalf - 80,
					y: -100,
					exists: false
				},{
					//左下
					x: 0 - centralWidthHalf - 80,
					y: 100,
					exists: false
				},{
					//左
					x: 0 - centralWidthHalf - 80,
					y: 0,
					exists: false
				}
				
			];
			//循环所有节点
			for(var topicId in MD.model.topics){
				//循环6个基本位置，判断位置内是否有图形
				for(var i = 0; i < basicPos.length; i++){
					var pos = basicPos[i];
					if(pos.exists == false){
						var topicObj = MD.model.topics[topicId];
						var topicDom = $("#" + topicId);
						if(topicObj.pos.y - topicDom.height() / 2 < pos.y + bounding.height()
							|| topicObj.pos.y + topicDom.height() / 2 > pos.y){
							pos.exists = true;
						}
					}
				}
			}
			var topicPos = null;
			//循环6个基本位置，判断位置内是否有图形
			for(var i = 0; i < basicPos.length; i++){
				var pos = basicPos[i];
				if(pos.exists == false){
					topicPos = {
						x: pos.x,
						y: pos.y
					};
					break;
				}
			}
			if(topicPos != null){
				bounding.css({
					left: center.x + topicPos.x,
					top: center.y + topicPos.y
				});
			}
			MD.model.topics[newId] = {
				id: newId,
				title: "Main Topic",
				pos: topicPos,
				parent: parentId
			}
			//*********
			//判断应该添加到左边还是右边
			//*********
			var rightTopics = $(".tp_right");
			var leftTopics = $(".tp_left");
			//右边高度
			var rightH = 0;
			$(".tp_right").each(function(index){
				rightH += ($(this).height() + marginBottom);
			});
			if(rightTopics.length <= 2 && leftTopics.length == 0 && rightH < 400){
				//右边主题数量小于3，左边无主题，并且右边高度小于400时，默认添加到右边
				bounding.addClass("tp_right");
			}else{
				var leftH = 0;
			}
			
			//如果只有一个
			var marginBottom = 50;
			var leftH = bounding.height();
			var rightH = bounding.height();
			if($(".tp_right").length == 0){
				marginBottom = 100;
				rightH += marginBottom;
				leftH += marginBottom;
			}else
			//开始重新配列主题
			//判断应该添加到左边还是右边，判断左右哪边内容更多
			$(".tp_right").each(function(index){
				rightH += ($(this).height() + marginBottom);
			});
			$(".tp_left").each(function(index){
				leftH += ($(this).height() + marginBottom);
			});
			if(rightH <= leftH){
				//如果右边高度较小，添加到右边
				bounding.addClass("tp_right");
				var beginY = center.y - rightH / 2;
				$(".tp_right").each(function(index){
					$(this).css({
						left: center.x + centralWidthHalf + 80,
						top: beginY
					});
					beginY += $(this).height() + marginBottom;
				});
			}else{
				bounding.addClass("tp_left");
				var beginY = center.y - leftH / 2;
				$(".tp_left").each(function(){
					$(this).css({
						left: center.x - centralWidthHalf - 80 - $(this).width(),
						top: beginY
					});
					beginY += $(this).height() + marginBottom;
				});
			}
		}
		/**
		 * 排列主题
		 */
		function rangeTopics(bounding){
			var count = MD.model.topics.length;
			var central = $("#central_topic");
			var pos = null;
			if(count == 0){
				pos = {
					x: central.width() / 2 + 100,
					y: -100
				}
			}else if(count == 1){
				pos = {
					x: central.width() / 2 + 100,
					y: 100
				}
			}
			var center = {
				x: MD.config.canvasWidth / 2,
				y: MD.config.canvasHeight / 2
			};
			bounding.css({
				left: center.x + pos.x,
				top: center.y + pos.y
			});
			return pos;
		}
	}
};
$(function(){
	MD.init();
});