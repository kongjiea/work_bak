$.fn.moveUp=function(options){  
    var defaults={  
        moveObj:'.tempWrap',//滚动的对象  
        cloneCont:'.contUL',//要复制的内容外层obj  
        childElement:'.contUL li',//复制的一个内容的子元素
        num:'5',//滚动的个数  
        time:'15'  
    };  
  
    var opts=$.extend({},defaults,options);  
    $(this).each(function(){
        var c=$(this),  
            $tempWrap=c.find(opts.moveObj),//滚动的obj  
            clone=c.find(opts.cloneCont).clone(),//滚动的内容obj  
            speed=1,//速度  
            oneElementHeight=c.find(opts.childElement).eq(0).height(),//一个内容的高度  
            limitHeight=oneElementHeight*opts.num,//
            timer=null;
        
        if($tempWrap.height()> limitHeight ){
            timer=setInterval(domove,opts.time);  
            $tempWrap.append(clone);
        }   
        function domove(){
            speed+=1;  
            if (speed>$(opts.cloneCont).height()) {  
                speed=0;  
            };  
            $tempWrap.css({'marginTop':-speed+'px'});  
        } 
        c.find('.contUL').hover(function(){  
            clearInterval(timer);  
        },function(){ 
            if($tempWrap.height()> c.find(opts.childElement).eq(0).height()*opts.num){  
                timer=setInterval(domove,opts.time); 
                if(c.find(opts.cloneCont).length==1){//解决初始化没滚动，但是异步添加数据后，鼠标放上去却滚动了，但是滚动没有追加内容
                    $tempWrap.append(clone);
                }
            }   
        });  
    });  
}; 
var lottery={
    index:-1,   //当前转动到哪个位置，起点位置
    count:0,    //总共有多少个位置
    timer:0,    //setTimeout的ID，用clearTimeout清除
    speed:50,   //初始转动速度
    times:0,    //转动次数
    cycle:50,   //转动基本次数：即至少需要转动多少次再进入抽奖环节
    prize:-1,   //中奖位置
    click:false,
    data:{},
    cishu:0,
    init:function(id,cycle,speed){
        if ($("#"+id).find(".data-info").length>0) {
            $lottery = $("#"+id);
            $units = $lottery.find(".data-info");
            this.obj = $lottery;
            this.count = $units.length;
            $lottery.find(".data-info-"+this.index).addClass("active");
        };
        this.cycle = cycle?cycle:50;
        this.speed = speed?speed:50;
    },
    roll:function(){
        var index = this.index;
        var count = this.count;
        var lottery = this.obj;
        $(lottery).find(".data-info-"+index).removeClass("active");
        index += 1;
        if (index>count-1) {
            index = 0;
        };
        $(lottery).find(".data-info-"+index).addClass("active");
        this.index=index;
        return false;
    },
    stop:function(index){
        this.prize=index;
        return false;
    },
    draw:function(){
        var that=this;
        var datas=this.data;
        this.times += 1;  //次数自增
        this.roll(); //
        if (this.times > this.cycle+10 && this.prize==this.index) {
            clearTimeout(this.timer);
            //alert("中奖了"+datas.prize);
            var _that=this;
            setTimeout(function(){
                $('#mask2').hide();
                $("#lotteryResult,#mask").show();
                _that.showRecordList();
                _that.prize=-1;
                _that.times=0;
                _that.click=false;
            },500);
        }else{//还在转
            if (this.times<this.cycle) {
                this.speed -= 10;
            }else if(this.times==this.cycle) {
                //var index = Math.random()*(this.count)|0;
                var index = datas.index; // 这里传中奖的位置
                this.prize = index;      
            }else{//转动次数大于圈数
                if (this.times > this.cycle+10 && ((this.prize==0 && this.index==7) || this.prize==this.index+1)) {// 第二个会出现
                    this.speed +=100;
                }else{
                    this.speed +=35;
                }
            }
            if (this.speed<40) {
                this.speed=40;
            };
            this.timer = window.setTimeout(function(){that.draw()},that.speed);
        }
        return false;
    },
    isRun:function(){
        var datas=this.data;
        var responseCode = $("#responseCode").val();
        if(datas.cishu>0 || (datas.cishu==0 && responseCode==0)){
            this.draw(datas);
            return true;
        }else if(datas.cishu*1==0 || datas.cishu==""){
            $("#mask2").hide();
            $("#lotteryResult,#mask").show();
            return false;
        }else{
            //alert("中奖次数没有了")
            return false;
        }
    },
    showRecordList:function(){
        $.post("${path}/activity_turntableRecordList", function(data){
            $("#lotteryRecordList").html(data);
            $(".pic4").find('.contUL').eq(1).html(data);
        });
    }
};
function init(){    
    //我的奖品
    $("#myPrize").click(function(){
        //step1.获取userId
        var userId = $("#currUserId").val();
        //step2.判断
        if(userId=='' || userId<=0){
            return ;
        }
        //stpe3.调用,回填
        $.post("${path}/activity_turntableRecordList?userId="+userId, function(data){
            $("#lotteryResultContent").html("");//先清空数据
            $("#lotteryResultContent").html(data);
            $("#lotteryResult").show();
        });
    });
    
    lottery.init('lottery_box',30);
    $("#lottery,.againBtn").live('click',function(){
        if($(this).hasClass('againBtn')){
            $("#lotteryResultContent").html("");
            $("#lotteryResult,#mask").hide();
        }
        
        if (lottery.click) {
            return false;
        }else{
            $.post("${path}/activity_turntableLottery", function(data){
                $('#mask2').show();
                //先清空数据
                $("#lotteryResultContent").html("");
                //step1.回填数据
                $("#lotteryResultContent").html(data);
                var json={
                    cishu:$("#lotteryCount").val(),
                    index:$("#level").val()
                };
                var responseCode = $("#responseCode").val();
                if($("#lotteryCount").val()==""){
                    if(responseCode==608){//积分不足
                        json.cishu=0;
                        $("#lotteryCount").val("0");
                        $('#cishu').html($("#lotteryCount").val());
                    };
                }else{
                    $('#cishu').html($("#lotteryCount").val());
                }
                //alert("次数："+json.cishu+"||位置："+json.index);
                lottery.data=json;
                lottery.speed=50;
                //$('#cishu').html($("#lotteryCount").val());
                if(lottery.isRun()){
                    lottery.click=true;
                }
                return false;
            });
        }
    });
    
    $('.ruleBtn').live('click',function(){
        $("#lotteryResult,#mask").hide();
        setTimeout(function(){
            $('html,body').stop().animate({'scrollTop':$('div.pic3').offset().top+'px'},800);
        },500);
    });
}


$('.closeBtn').live('click',function(){
    $("#lotteryResultContent").html("");
    $('.pop_box,#mask,#mask2').hide();
});
$('#myPrize').click(function(){
    $('.pop_box,#mask').show();
});
