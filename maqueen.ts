/** 
 * @file pxt-maqueen/maqueen.ts
 * @brief DFRobot's maqueen makecode library.
 * @n [Get the module here](https://www.dfrobot.com.cn/goods-1802.html)
 * @n This is a MakeCode graphical programming education robot.
 * 
 * @copyright    [DFRobot](http://www.dfrobot.com), 2016
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](jie.tang@dfrobot.com)
 * @date  2019-10-08
*/

let maqueencb: Action
let maqueenmycb: Action
let maqueene = "1"
let maqueenparam = 0
let alreadyInit = 0
let IrPressEvent = 0
const MOTER_ADDRESSS = 0x10

enum PingUnit {
    //% block="cm"
    Centimeters,
}
enum state {
        state1=0x10,
        state2=0x11,
        state3=0x20,
        state4=0x21
    }
interface KV {
    key: state;
    action: Action;
}

//% weight=10 color=#008B00 icon="\uf136" block="Maqueen"
namespace maqueen {

    let kbCallback: KV[] = []

    export class Packeta {
        public mye: string;
        public myparam: number;
    }

    export enum Motors {
        //% blockId="left motor" block="left"
        M1 = 0,
        //% blockId="right motor" block="right"
        M2 = 1,
        //% blockId="all motor" block="all"
        All = 2
    }

    export enum Servos {
        //% blockId="S1" block="S1"
        S1 = 0,
        //% blockId="S2" block="S2"
        S2 = 1
    }

    export enum Dir {
        //% blockId="CW" block="Forward"
        CW = 0x0,
        //% blockId="CCW" block="Backward"
        CCW = 0x1
    }

    export enum Patrol {
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 13,
        //% blockId="patrolRight" block="right"
        PatrolRight = 14
    }

    export enum Patrol1 {
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 0x10,
        //% blockId="patrolRight" block="right"
        PatrolRight = 0x20
    }
    export enum Voltage {
        //%block="high"
        High = 0x01,
        //% block="low"
        Low = 0x00
    }

    export enum LED {
        //% blockId="LEDLeft" block="left"
        LEDLeft = 8,
        //% blockId="LEDRight" block="right"
        LEDRight = 12
    }

    export enum LEDswitch {
        //% blockId="turnOn" block="ON"
        turnOn = 0x01,
        //% blockId="turnOff" block="OFF"
        turnOff = 0x00
    }

    //% advanced=true shim=maqueenIR::initIR
    function initIR(pin: Pins): void {
        return
    }

    //% advanced=true shim=maqueenIR::onPressEvent
    function onPressEvent(btn: RemoteButton, body: Action): void {
        return
    }

    //% advanced=true shim=maqueenIR::getParam
    function getParam(): number {
        return 0
    }

    function maqueenInit(): void {
        if (alreadyInit == 1) {
            return
        }
        initIR(Pins.P16)
        alreadyInit = 1
    }

    //% weight=2
    //% blockGap=50
    //% blockId=IR_callbackUser block="on IR received"
    export function IR_callbackUser(maqueencb: (message: number) => void) {
        maqueenInit();
        IR_callback(() => {
            const packet = new Packeta();
            packet.mye = maqueene;
            maqueenparam = getParam();
            packet.myparam = maqueenparam;
            maqueencb(packet.myparam);
        });
    }

    /**
     * Read IR sensor value.
     */

    //% weight=10
    //% blockId=IR_read block="read IR key"
    export function IR_read(): number {
        maqueenInit()
        return getParam()
    }

    /**
     * Read the version number.
     */

    //% weight=10
    //% blockId=IR_read_version block="get product information"
    export function IR_read_version(): string {
        maqueenInit()
        pins.i2cWriteNumber(0x10, 50, NumberFormat.UInt8BE);
        let dataLen = pins.i2cReadNumber(0x10, NumberFormat.UInt8BE);
        pins.i2cWriteNumber(0x10, 51, NumberFormat.UInt8BE);
        let buf = pins.i2cReadBuffer(0x10, dataLen, false);
        let version = "";
        for (let index = 0; index < dataLen; index++) {
            version += String.fromCharCode(buf[index])
        }
        return version
    }

    function IR_callback(a: Action): void {
        maqueencb = a
        IrPressEvent += 1
        onPressEvent(IrPressEvent, maqueencb)
    }

    /**
     * Read ultrasonic sensor.
     */

    //% blockId=ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=95
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let d
        pins.digitalWritePin(DigitalPin.P1, 0);
        if (pins.digitalReadPin(DigitalPin.P2) == 0) {
            pins.digitalWritePin(DigitalPin.P1, 1);
            pins.digitalWritePin(DigitalPin.P1, 0);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 58);
        } else {
            pins.digitalWritePin(DigitalPin.P1, 0);
            pins.digitalWritePin(DigitalPin.P1, 1);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.Low, maxCmDistance * 58);
        }
        let x = d / 39;
        if (x <= 0 || x > 500) {
            return 0;
        }
        switch (unit) {
            case PingUnit.Centimeters: return Math.round(x);
            default: return Math.idiv(d, 2.54);
        }

    }

    /**
     * Set the direction and speed of Maqueen motor.
     */

    //% weight=90
    //% blockId=motor_MotorRun block="motor|%index|move|%Dir|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        let buf = pins.createBuffer(3);
        if (index == 0) {
            buf[0] = 0x00;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (index == 1) {
            buf[0] = 0x02;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (index == 2) {
            buf[0] = 0x00;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
            buf[0] = 0x02;
            pins.i2cWriteBuffer(0x10, buf);
        }
    }

    /**
     * Stop the Maqueen motor.
     */
    //% weight=20
    //% blockId=motor_motorStop block="motor |%motors stop"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    export function motorStop(motors: Motors): void {
        let buf = pins.createBuffer(3);
        if (motors == 0) {
            buf[0] = 0x00;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (motors == 1) {
            buf[0] = 0x02;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
        }

        if (motors == 2) {
            buf[0] = 0x00;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
            buf[0] = 0x02;
            pins.i2cWriteBuffer(0x10, buf);
        }

    }

    /**
     * Read line tracking sensor.
     */

    //% weight=20
    //% blockId=read_Patrol block="read |%patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    export function readPatrol(patrol: Patrol): number {
        if (patrol == Patrol.PatrolLeft) {
            return pins.digitalReadPin(DigitalPin.P13)
        } else if (patrol == Patrol.PatrolRight) {
            return pins.digitalReadPin(DigitalPin.P14)
        } else {
            return -1
        }
    }

    /**
     * Turn on/off the LEDs.
     */

    //% weight=20
    //% blockId=writeLED block="LEDlight |%led turn |%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: LED, ledswitch: LEDswitch): void {
        if (led == LED.LEDLeft) {
            pins.digitalWritePin(DigitalPin.P8, ledswitch)
        } else if (led == LED.LEDRight) {
            pins.digitalWritePin(DigitalPin.P12, ledswitch)
        } else {
            return
        }
    }

    /**
     * Set the Maqueen servos.
     */

    //% weight=90
    //% blockId=servo_ServoRun block="servo|%index|angle|%angle"
    //% angle.min=0 angle.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function servoRun(index: Servos, angle: number): void {
        let buf = pins.createBuffer(2);
        if (index == 0) {
            buf[0] = 0x14;
        }
        if (index == 1) {
            buf[0] = 0x15;
        }
        buf[1] = angle;
        pins.i2cWriteBuffer(0x10, buf);
    }

     /**
     * Line tracking sensor event function
     */
    //% weight=2
    //% blockId=kb_event block="on|%value line tracking sensor|%vi"
    export function ltEvent(value: Patrol1, vi: Voltage, a: Action) {
         let state = value + vi;
        serial.writeNumber(state)
        let item: KV = { key: state, action: a };
        kbCallback.push(item);
    }
    let x:number
    let i:number = 1;
    function patorlState():number{
        switch(i){
            case 1: x = pins.digitalReadPin(DigitalPin.P13) == 0 ? 0x10:0;break;
            case 2: x = pins.digitalReadPin(DigitalPin.P13) == 1 ? 0x11:0;break;
            case 3: x = pins.digitalReadPin(DigitalPin.P14) == 0 ? 0x20:0;break;
            default:x = pins.digitalReadPin(DigitalPin.P14) == 1 ? 0x21:0;break;
        }
        i+=1;
        if(i==5)i=1;
        
        return x;
    }

     basic.forever(() => {
        if (kbCallback != null) {
            let sta = patorlState();
            if (sta != 0) {
                for (let item of kbCallback) {
                    if (item.key == sta) {
                        item.action();
                    }
                }
            }
        }
        basic.pause(50);
    })

}
