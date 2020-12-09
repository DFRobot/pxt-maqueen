#include "MicroBit.h"

MicroBit uBit;
int ir_code = 0x00;
int ir_addr = 0x00;


int logic_value(){//判断逻辑值“0”和“1”子函数
    uint32_t lasttime = system_timer_current_time_us();
    uint32_t nowtime;
    while(!uBit.io.P16.getDigitalValue());//低等待
    nowtime = system_timer_current_time_us();
    if((nowtime - lasttime) > 400 && (nowtime - lasttime) < 700){//低电平560us
        while(uBit.io.P16.getDigitalValue());//是高就等待
        lasttime = system_timer_current_time_us();
        if((lasttime - nowtime)>400 && (lasttime - nowtime) < 700){//接着高电平560us
            return 0;
        }else if((lasttime - nowtime)>1500 && (lasttime - nowtime) < 1800){//接着高电平1.7ms
            return 1;
       }
    }
uBit.serial.printf("error\r\n");
    return -1;
}

void pulse_deal(){
    int i;
    ir_addr=0x00;//清零
    for(i=0; i<16;i++ )
    {
      if(logic_value() == 1)
      {
        ir_addr |=(1<<i);
      }
    }
    //解析遥控器编码中的command指令
    ir_code=0x00;//清零
    for(i=0; i<16;i++ )
    {
      if(logic_value() == 1)
      {
        ir_code |=(1<<i);
      }
    }

}

void remote_decode(void){
    uint32_t lasttime = system_timer_current_time_us();
    uint32_t nowtime;
    while(uBit.io.P16.getDigitalValue()){//高电平等待
        nowtime = system_timer_current_time_us();
        if((nowtime - lasttime) > 100000){//超过100 ms,表明此时没有按键按下
            ir_code = 0xff00;
            return;
        }
    }
    //如果高电平持续时间不超过100ms
    lasttime = system_timer_current_time_us();
    while(!uBit.io.P16.getDigitalValue());//低等待
    nowtime = system_timer_current_time_us();
    if((nowtime - lasttime) < 10000 && (nowtime - lasttime) > 8000){//9ms
        while(uBit.io.P16.getDigitalValue());//高等待
        lasttime = system_timer_current_time_us();
        if((lasttime - nowtime) > 4000 && (lasttime - nowtime) < 5000){//4.5ms,接收到了红外协议头且是新发送的数据。开始解析逻辑0和1
            pulse_deal();
            uBit.serial.printf("addr=0x%X,code = 0x%X\r\n",ir_addr,ir_code);
            return;
        }else if((lasttime - nowtime) > 2000 && (lasttime - nowtime) < 2500){//2.25ms,表示发的跟上一个包一致
            while(!uBit.io.P16.getDigitalValue());//低等待
            nowtime = system_timer_current_time_us();
            if((nowtime - lasttime) > 500 && (nowtime - lasttime) < 700){//560us
                uBit.serial.printf("addr=0x%X,code = 0x%X\r\n",ir_addr,ir_code);
                return;
            }
        }
    }
}

int main()
{

    uBit.init();
    while(1){
        remote_decode();
    }
}