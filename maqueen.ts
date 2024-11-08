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


//%
//% weight=100 color=#008B00 icon="\uf136" block="Maqueen v4"
//% groups=['Maqueen_v4','Maqueen_v5']
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








    /**
     * Read the version number.
     */

    //% weight=10
    //% blockId=IR_read_version block="get product information"
    export function IR_read_version(): string {
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

    /**
     * Read ultrasonic sensor.
     */
    let state1 = 0;
    //% blockId=ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=95
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let data;
        let i = 0;
        data = readUlt(unit);
        if (state1 == 1 && data != 0) {
            state1 = 0;
        }
        if (data != 0) {
        } else {
            if (state1 == 0) {
                do {
                    data = readUlt(unit);
                    i++;
                    if (i > 3) {
                        state1 = 1;
                        data = 500;
                        break;
                    }
                } while (data == 0)
            }
        }
        if (data == 0)
            data = 500
        return data;

    }
    function readUlt(unit: number): number {
        let d
        pins.digitalWritePin(DigitalPin.P1, 1);
        basic.pause(1)
        pins.digitalWritePin(DigitalPin.P1, 0);
        if (pins.digitalReadPin(DigitalPin.P2) == 0) {
            pins.digitalWritePin(DigitalPin.P1, 0);
            pins.digitalWritePin(DigitalPin.P1, 1);
            basic.pause(20)
            pins.digitalWritePin(DigitalPin.P1, 0);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.High, 500 * 58);//readPulseIn(1);
        } else {
            pins.digitalWritePin(DigitalPin.P1, 1);
            pins.digitalWritePin(DigitalPin.P1, 0);
            basic.pause(20)
            pins.digitalWritePin(DigitalPin.P1, 0);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.Low, 500 * 58);//readPulseIn(0);
        }
        let x = d / 59;
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

    let x: number
    let i: number = 1;
    function patorlState(): number {
        switch (i) {
            case 1: x = pins.digitalReadPin(DigitalPin.P13) == 0 ? 0x10 : 0; break;
            case 2: x = pins.digitalReadPin(DigitalPin.P13) == 1 ? 0x11 : 0; break;
            case 3: x = pins.digitalReadPin(DigitalPin.P14) == 0 ? 0x20 : 0; break;
            default: x = pins.digitalReadPin(DigitalPin.P14) == 1 ? 0x21 : 0; break;
        }
        i += 1;
        if (i == 5) i = 1;

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






































/*''''''''''''''''''''''''''''''''''    maqueen V5  ''''''''''''''''''''''''''''''''''''''''''''''''''*/

















//% group="Maqueen_v5"
//% weight=100 color=#0fbc11 icon="\uf004" block="Maqueen v5"
namespace Maqueen_V5 {
    let neopixel_buf = pins.createBuffer(16 * 3);
    for (let i = 0; i < 16 * 3; i++) {
        neopixel_buf[i] = 0
    }
    let _brightness = 255

    interface KV1 {
        key: number;
        key1: number;
        action: Action;
    }

    let kbCallback1: KV1[] = [];
    let kbCallback2: KV[] = [];
    const I2CADDR = 0x10;
    let servo1_num:number = 20;
    let servo2_num: number = 20;
    export enum Patrolling {
        //% block="ON"
        ON = 1,
        //% block="OFF"
        OFF = 2,
    }
    export enum PatrolSpeed {
        //% block="1"
        speed1 = 1,
        //% block="2"
        speed2 = 2,
        //% block="3"
        speed3 = 3,
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
    export enum Patrol {
        //% blockId="patrolLeft" block="L1"
        L1 = 1,
        //% blockId="patrolMiddle" block="M"
        M = 2,
        //% blockId="patrolRight" block="R1"
        R1 = 3
    }
    export enum SpeedGrade {
        //% block="1"
        speed1 = 1,
        //% block="2"
        speed2 = 2,
        //% block="3"
        speed3 = 3,
        //% block="4"
        speed4 = 4,
        //% block="5"
        speed5 = 5
    }

    export enum Dir {
        //% blockId="CW" block="Forward"
        CW = 0x0,
        //% blockId="CCW" block="Backward"
        CCW = 0x1
    }
    export enum Voltage {
        //%block="high"
        High = 0x01,
        //% block="low"
        Low = 0x00
    }

    export enum DirectionType {
        //% block="left led light"
        Left = 0,
        //% block="right led light"
        Right = 1,
        //% block="all led light"
        All = 2,
    }

    export enum BatteryType {
        //% block="Lithium battery"
        Lithium = 0,
        //% block="Alkaline battery"
        Alkaline = 1,
    }

    /**
     * Well known colors
     */
    export enum NeoPixelColors {
        //% block=red
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=yellow
        Yellow = 0xFFFF00,
        //% block=green
        Green = 0x00FF00,
        //% block=blue
        Blue = 0x0000FF,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xFF00FF,
        //% block=white
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }
    export enum CarLightColors {
        //% block=red
        Red = 1,
        //% block=green
        Green = 2,
        //% block=yellow
        Yellow = 3,
        //% block=blue
        Blue = 4,
        //% block=purple
        Purple = 5,
        //% block=cyan
        Cyan = 6,
        //% block=white
        White = 7,
        //% block=black
        Black = 8
    }
    const enum BleCmd {
        BleForward = 1,         /**< advance */
        BleBackward = 2,         /**< astern */
        BleLeft = 3,             /**< turn left */
        BleRight = 4,           /**< turn right */
        BleRgbR = 5,           /**< Red */
        BleRgbG = 6,            /**< Green */
        BleRgbB = 7,           /**< Blue */
        BleRgbRB = 8,          /**< Purple */
        BleRgbRG = 9,          /**< Yellow */
        BleRgbGB = 10,         /**< Cyan */
        BleRgbRGB = 11,        /**< White */
        BleRgbOff = 12,        /**< Off */
        BleServo1Right = 13,   /**< servo1 turn right */
        BleServo1Left = 14,     /**< servo1 turn left */
        BleServo2Right = 15,    /**< servo2 turn right */
        BleServo2Left = 16,    /**< servo2 turn left */
    };
     const  MOTOR_0                    =0
     const  SPEED_0                    =1
     const  MOTOR_1                    =2
     const  SPEED_1                    =3

     const  RGB_L                      =11
     const  RGB_R                      =12
     const  RGB_BLINK_NUM_L            =13
     const  RGB_BLINK_GRADE_L          =14
     const  RGB_BLINK_NUM_R            =15
     const  RGB_BLINK_GRADE_R          =16
     const  RGB_GRADUAL_CHANGE_GRADE_L =17
     const  RGB_GRADUAL_CHANGE_GRADE_R =18


     const  SERVO_1                    =20
     const  SERVO_2                    =21

     const  BLACK_ADC_STATE            =29
     const  ADC_COLLECT_0              =30
     const  ADC_COLLECT_1              =32
     const  ADC_COLLECT_2              =34
     const  ADC_COLLECT_3              =36
     const  ADC_COLLECT_4              =38

     const  LIGHTL_H                   =41
     const  LIGHTL_L                   =42
     const  LIGHTR_H                   =43
     const  LIGHTR_L                   =44
     const  BATTERY_SET                =45
     const  BATTERY                    =46
     const  MOTOR_TYPE_H               =47
     const  MOTOR_TYPE_L               =48
     const  VERSON_LEN                 =50
     const  VERSON_DATA                =51
     const  MY_SYS_INIT                =70
     const  LINE_WALKING               =71
     const  LINE_SPEED_GRADE           =72
     const  CAR_STATE                  =73
     const  CROSS_DEFAULT              =75
     const  T1_DEFAULT                 =76
     const  T2_DEFAULT                 =77
     const  T3_DEFAULT                 =78
     const  BLECMD                     =80

    /**
     *  Init I2C until success
    */
    //% weight=255
    //% blockId=I2CInit block="initialize via I2C until success"
    //%group="Maqueen_v5"
    export function I2CInit(): void {
        let versionLen = 0;
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 0x46;
        allBuffer[1] = 1;
        pins.i2cWriteBuffer(I2CADDR, allBuffer); //V5 systemInit
        basic.pause(100);//waiting  reset

        pins.i2cWriteNumber(I2CADDR, 0x32, NumberFormat.Int8LE);
        versionLen = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        while (versionLen == 0) {
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `, 10)
            basic.pause(500)
            basic.clearScreen()
            pins.i2cWriteNumber(I2CADDR, 0x32, NumberFormat.Int8LE);
            versionLen = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        }
        basic.showLeds(`
                . . . . .
                . . . . #
                . . . # .
                # . # . .
                . # . . .
                `, 10)
        basic.pause(500)
        basic.clearScreen()
    }

    function I2CWirte(Reg:number,data:number){
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = Reg;
        allBuffer[1] = data;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }
    /**
     * Start or close the line patrol
     * @param patrol to patrol ,eg: Patrolling.ON
     */
    //% weight=253
    //% blockId=patrolling block="Line patrolling| %Patrolling"
    //% group="Maqueen_v5"
    export function patrolling(patrol: Patrolling){
        let allBuffer = pins.createBuffer(2);
        if (patrol == Patrolling.ON)
            allBuffer[1] = 1
        else
            allBuffer[1] = 0;
        allBuffer[0] = LINE_WALKING;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }
    /**
     * Set the tracking speed
     * @param speed of Line patrol
     */
    //% weight=254
    //% blockId=patrolSpeed block="set the speed of Line patrol| %PatrolSpeed"
    //% group="Maqueen_v5"
    export function patrolSpeed(speed: PatrolSpeed) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = LINE_SPEED_GRADE;
        allBuffer[1] = speed;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * Control motor module running
     * @param motor Motor selection enumeration
     * @param dir   Motor direction selection enumeration
     * @param speed  Motor speed control, eg:100
     */
    //% weight=252
    //% blockId= V5_motor block="motor|%index|move|%Dir|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% group="Maqueen_v5"
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        let buf = pins.createBuffer(3);
        if (index == 0) {
            buf[0] = MOTOR_0;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(MOTER_ADDRESSS, buf);
        }
        if (index == 1) {
            buf[0] = MOTOR_1;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(MOTER_ADDRESSS, buf);
        }
        if (index == 2) {
            buf[0] = MOTOR_0;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(MOTER_ADDRESSS, buf);
            buf[0] = MOTOR_1;
            pins.i2cWriteBuffer(MOTER_ADDRESSS, buf);
        }
    }

    /**
     * Read the version number.
     */

    //% weight=1
    //% blockId=readVersion block="get product information"
    //% group="Maqueen_v5"
    export function readVersion(): string {
        pins.i2cWriteNumber(I2CADDR, 50, NumberFormat.UInt8BE);
        let dataLen = pins.i2cReadNumber(I2CADDR, NumberFormat.UInt8BE);
        pins.i2cWriteNumber(I2CADDR, 51, NumberFormat.UInt8BE);
        let buf = pins.i2cReadBuffer(I2CADDR, dataLen, false);
        let version = "";
        for (let index = 0; index < dataLen; index++) {
            version += String.fromCharCode(buf[index])
        }
        return version
    }
    /**
     * Read ultrasonic sensor.
     */
    let state1 = 0;
    //% blockId=V5_ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=95
    //% group="Maqueen_v5"
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let data;
        let i = 0;
        data = readUlt(unit);
        if (state1 == 1 && data != 0) {
            state1 = 0;
        }
        if (data != 0) {
        } else {
            if (state1 == 0) {
                do {
                    data = readUlt(unit);
                    i++;
                    if (i > 3) {
                        state1 = 1;
                        data = 500;
                        break;
                    }
                } while (data == 0)
            }
        }
        if (data == 0)
            data = 500
        return data;

    }
    function readUlt(unit: number): number {
        let d
        pins.digitalWritePin(DigitalPin.P1, 1);
        basic.pause(1)
        pins.digitalWritePin(DigitalPin.P1, 0);
        if (pins.digitalReadPin(DigitalPin.P2) == 0) {
            pins.digitalWritePin(DigitalPin.P1, 0);
            pins.digitalWritePin(DigitalPin.P1, 1);
            basic.pause(20)
            pins.digitalWritePin(DigitalPin.P1, 0);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.High, 500 * 58);//readPulseIn(1);
        } else {
            pins.digitalWritePin(DigitalPin.P1, 1);
            pins.digitalWritePin(DigitalPin.P1, 0);
            basic.pause(20)
            pins.digitalWritePin(DigitalPin.P1, 0);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.Low, 500 * 58);//readPulseIn(0);
        }
        let x = d / 59;
        switch (unit) {
            case PingUnit.Centimeters: return Math.round(x);
            default: return Math.idiv(d, 2.54);
        }
    }

    /**
     * Control the motor module to stop running
     * @param emotor Motor selection enumeration
     */

    //% weight=240
    //% blockId=V5_motorStop block="motor |%motors stop"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    //% group="Maqueen_v5"
    export function motorStop(motors: Motors): void {
        let buf = pins.createBuffer(3);
        if (motors == 0) {
            buf[0] = MOTOR_0;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(I2CADDR, buf);
        }
        if (motors == 1) {
            buf[0] = MOTOR_1;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(I2CADDR, buf);
        }

        if (motors == 2) {
            buf[0] = MOTOR_0;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(I2CADDR, buf);
            buf[0] = MOTOR_1;
            pins.i2cWriteBuffer(I2CADDR, buf);
        }

    }
    /**
     * Get the state of the patrol sensor
     * @param eline Select the inspection sensor enumeration
     */
    //% weight=20
    //% blockId=readPatrol block="read line sensor |%Patrol  state"
    //% group="Maqueen_v5"

    export function readPatrol(patrol: Patrol): number {
        pins.i2cWriteNumber(I2CADDR, BLACK_ADC_STATE, NumberFormat.UInt8BE);
        let buf = pins.i2cReadNumber(I2CADDR, NumberFormat.UInt8BE, false);
        if (buf & (1 << (3 - patrol)))
            return 1;
        else
            return 0;
    }
    
    /**
     * The ADC data of the patrol sensor is obtained
     * @param eline Select the inspection sensor enumeration
     */
    //% weight=21
    //% blockId= readPatrolData block="read line sensor |%Patrol  ADC data"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    //% group="Maqueen_v5"
    export function readPatrolData(patrol: Patrol): number {
        let data;
        switch (patrol) {
            case Patrol.L1:
                pins.i2cWriteNumber(I2CADDR, ADC_COLLECT_1, NumberFormat.Int8LE);
                let adc0Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc0Buffer[0] << 8 | adc0Buffer[1]
                break;
            case Patrol.M:
                pins.i2cWriteNumber(I2CADDR, ADC_COLLECT_2, NumberFormat.Int8LE);
                let adc1Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc1Buffer[0] << 8 | adc1Buffer[1];
                break;
            case Patrol.R1:
                pins.i2cWriteNumber(I2CADDR, ADC_COLLECT_3, NumberFormat.Int8LE);
                let adc2Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc2Buffer[0] << 8 | adc2Buffer[1];
                break;

            default:
                data=0;
                break;

        }
        return data;
    }

    /**
     * Control the Maqueen steering Angle
     * @param eline Select the inspection sensor enumeration
     */

    //% weight=90
    //% blockId=V5_Servo block="servo|%index|angle|%angle"
    //% angle.min=0 angle.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% group="Maqueen_v5"
    export function servoRun(index: Servos, angle: number): void {
        let buf = pins.createBuffer(2);
        if (index == 0) {
            buf[0] = SERVO_1;
        }
        if (index == 1) {
            buf[0] = SERVO_2;
        }
        buf[1] = angle;
        pins.i2cWriteBuffer(I2CADDR, buf);
    }
  

    /**
     * Sets the color of the RGB lamp
     * @param type to type ,eg: DirectionType.Left
     * @param rgb to rgb ,eg: CarLightColors.Red
     */

    //% block="RGB Car Lights %type color %rgb"
    //% weight=11
    //% group="Maqueen_v5"
    export function setRgblLed(type: DirectionType, rgb: CarLightColors) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[1] = rgb;
        if (type == DirectionType.Left) {
            allBuffer[0] = RGB_L;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        } else if (type == DirectionType.Right) {
            allBuffer[0] = RGB_R;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        } else if (type == DirectionType.All) {
            allBuffer[0] = RGB_L;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
            allBuffer[0] = RGB_R;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        }
    }
    /**
     * Set RGB lights to flash
     * @param type to type ,eg: DirectionType.Left
     * @param num of flashes
     * @param grade Select the speed level enumeration
     * @param rgb Select color
     */
    //% inlineInputMode=inline
    //% block="RGB Car Lights |%type Number of flashes |%number Level of flashes |%SpeedGrade color |%rgb"
    //% weight=11
    //% num.min=0 num.max=255
    //% group="Maqueen_v5"
    export function setRgbBlink(type: DirectionType, num: number, grade: SpeedGrade, rgb: CarLightColors) {
        if (type == DirectionType.Left) {
            I2CWirte(RGB_L, rgb);
            I2CWirte(RGB_BLINK_GRADE_L, grade);
            I2CWirte(RGB_BLINK_NUM_L, num);
        } else if (type == DirectionType.Right) {
            I2CWirte(RGB_R, rgb);
            I2CWirte(RGB_BLINK_GRADE_R, grade);
            I2CWirte(RGB_BLINK_NUM_R, num);
        } else if (type == DirectionType.All) {
            I2CWirte(RGB_L, rgb);
            I2CWirte(RGB_BLINK_GRADE_L, grade);
            I2CWirte(RGB_BLINK_NUM_L, num);
            I2CWirte(RGB_R, rgb);
            I2CWirte(RGB_BLINK_GRADE_R, grade);
            I2CWirte(RGB_BLINK_NUM_R, num);
        }
    }

    /**
     * Set the RGB light gradient
     * @param type to type ,eg: DirectionType.Left
     * @param  Select the speed level enumeration
     */
    //% block="RGB Car Lights |%type Level of change |%SpeedGrade"
    //% weight=11
    //% group="Maqueen_v5"
    export function setRgbchange(type: DirectionType, grade: SpeedGrade) {
        if (type == DirectionType.Left) {
            I2CWirte(RGB_GRADUAL_CHANGE_GRADE_L, grade);
        } else if (type == DirectionType.Right) {
            I2CWirte(RGB_GRADUAL_CHANGE_GRADE_R, grade);
        }
        else if (type == DirectionType.All) {
            I2CWirte(RGB_GRADUAL_CHANGE_GRADE_L, grade);
            I2CWirte(RGB_GRADUAL_CHANGE_GRADE_R, grade);
        }
    }
    /**
     * Turn off all RGB
     * @param type to type ,eg: DirectionType.Left
     */
    //% block="Close |%type RGB Car Lights  "
    //% weight=11
    //% group="Maqueen_v5"
    export function setRgbOff(type: DirectionType) {
        setRgblLed(type,CarLightColors.Black);
    }
    /**
     * Reading light intensity
     */
    //% block="Read Light Values %type"
    //% weight=16
    //% group="Maqueen_v5"
    export function readLightIntensity(type: DirectionType): number {
        let allBuffer = pins.createBuffer(2);
        if (type == DirectionType.Left){
            pins.i2cWriteNumber(I2CADDR, LIGHTL_H, NumberFormat.Int8LE);
            allBuffer = pins.i2cReadBuffer(I2CADDR, 2);
            return allBuffer[0] << 8 | allBuffer[1];
        }else{
            pins.i2cWriteNumber(I2CADDR, LIGHTR_H, NumberFormat.Int8LE);
            allBuffer = pins.i2cReadBuffer(I2CADDR, 2);
            return allBuffer[0] << 8 | allBuffer[1];
        }
            
    }
    /**
     * Getting battery level
     */
    //% block="Read battery Values %type"
    //% weight=16
    //% group="Maqueen_v5"
    export function getBatteryData(type: BatteryType): number {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0]=BATTERY_SET;
        allBuffer[1] = type;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        basic.pause(50);
        pins.i2cWriteNumber(I2CADDR, BATTERY, NumberFormat.Int8LE);
        allBuffer = pins.i2cReadBuffer(I2CADDR, 1);
        let temp_data = allBuffer[0];
        if (temp_data > 100) temp_data=100;
        return temp_data;
    }
    /**
     * Bluetooth commands control the configuration by default
     * @param Received Bluetooth command
     */
    //% block="Maqueen_v5 Default Bluetooth command control %cmd"
    //% weight=1
    //% group="Maqueen_v5"
    export function BleCmdDefault(cmd: number){
        switch (cmd) {
            case BleCmd.BleForward:
                motorRun(Motors.All, Dir.CW,100);
                basic.pause(100);
                motorRun(Motors.All, Dir.CW, 0);
                break;
            case BleCmd.BleBackward:
                motorRun(Motors.All, Dir.CCW, 100);
                basic.pause(100);
                motorRun(Motors.All, Dir.CCW, 0);
                break;
            case BleCmd.BleLeft:
                motorRun(Motors.M2, Dir.CCW, 100);
                basic.pause(100);
                motorRun(Motors.All, Dir.CCW, 0);
                break;
            case BleCmd.BleRight:
                motorRun(Motors.M1, Dir.CCW, 100);
                basic.pause(100);
                motorRun(Motors.All, Dir.CCW, 0);
                break;
            case BleCmd.BleRgbR:
                setRgblLed(DirectionType.All, CarLightColors.Red);
                break;
            case BleCmd.BleRgbG:
                setRgblLed(DirectionType.All, CarLightColors.Green);
                break;
            case BleCmd.BleRgbB:
                setRgblLed(DirectionType.All, CarLightColors.Blue);
                break;
            case BleCmd.BleRgbRB:
                setRgblLed(DirectionType.All, CarLightColors.Purple);
                break;
            case BleCmd.BleRgbRG:
                setRgblLed(DirectionType.All, CarLightColors.Yellow);
                break;
            case BleCmd.BleRgbGB:
                setRgblLed(DirectionType.All, CarLightColors.Cyan);
                break;
            case BleCmd.BleRgbRGB:
                setRgblLed(DirectionType.All, CarLightColors.White);
                break;
            case BleCmd.BleRgbOff:
                setRgblLed(DirectionType.All, CarLightColors.Black);
                break;
            case BleCmd.BleServo1Right:
                if (servo1_num < 180) servo1_num += 5;
                servoRun(Servos.S1, servo1_num);
                break;
            case BleCmd.BleServo1Left:
                if (servo1_num > 0) servo1_num -= 5;
                servoRun(Servos.S1, servo1_num);
                break;
            case BleCmd.BleServo2Right:
                if (servo2_num <= 180) servo2_num += 5;
                servoRun(Servos.S2, servo2_num);
                break;
            case BleCmd.BleServo2Left:
                if (servo2_num > 0) servo2_num -= 5;
                servoRun(Servos.S2, servo2_num);
                break;
            default:
                break;
        }

    }

    /**
     * Get Bluetooth commands
     */
    let Ble_state: number;
    let Ble_cmd: number;
    //% block="get Bluetooth commands"
    //% weight=3
     //% group="Maqueen_v5"
    export function BleGetCmd(): number {
        let allBuffer = pins.createBuffer(2);
        pins.i2cWriteNumber(I2CADDR, BLECMD, NumberFormat.Int8LE);
        allBuffer = pins.i2cReadBuffer(I2CADDR, 1);
        let temp_data = allBuffer[0];
        return temp_data;
    }
    /**
     * When Bluetooth data is received
     * @param value describe value here, eg: 5
     */
    //% weight=2
    //% block="When received"
    //% draggableParameters
    //% group="Maqueen_v5"
    export function BlecallbackUser(cb: (Blecmd: number) => void) {
        Ble_state = 1;
        control.onEvent(33, 44, function () {
            cb(Ble_cmd)
        })
    }

    basic.forever(() => {
        if (Ble_state == 1) {
            Ble_cmd = BleGetCmd();
            if (Ble_cmd != 0) {
                control.raiseEvent(33, 44)
            }
        }
        basic.pause(50);
    })



    /** 
   * Set the three primary color:red, green, and blue
   * @param r  , eg: 100
   * @param g  , eg: 100
   * @param b  , eg: 100
   */

    //% weight=60
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% block="red|%r green|%g blue|%b"
    //% group="Maqueen_v5"
    export function bottomRgb(r: number, g: number, b: number): number {
        return (r << 16) + (g << 8) + (b);
    }

    /**
     * The LED positions where you wish to begin and end
     * @param from  , eg: 0
     * @param to  , eg: 3
     */

    //% weight=60
    //% from.min=0 from.max=3
    //% to.min=0 to.max=3
    //% block="range from |%from with|%to leds"
    //% group="Maqueen_v5"
    export function bottomLedRange(from: number, to: number): number {
        return ((from) << 16) + (2 << 8) + (to);
    }
    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8
    //% blockId="neopixel_colors" block="%color"
    //% advanced=true
    export function colors(color: NeoPixelColors): number {
        return color;
    }
    /**
     * Set the color of the specified LEDs
     * @param index  , eg: 0
     */

    //% weight=60
    //% index.min=0 index.max=3 index.defl=0
    //% block="RGB light |%index show color|%rgb=neopixel_colors"
    //% group="Maqueen_v5"
    export function bottomSetColor(index: number, rgb: number) {
        let f = index;
        let t = index;
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);

        if (index > 15) {
            if (((index >> 8) & 0xFF) == 0x02) {
                f = index >> 16;
                t = index & 0xff;
            } else {
                f = 0;
                t = -1;
            }
        }
        for (let i = f; i <= t; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)

    }

    /**
     * Set the color of all RGB LEDs
     */

    //% weight=60
    //% block=" RGB show color |%rgb=neopixel_colors"
    //% group="Maqueen_v5"
    export function bottomShowColor(rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        for (let i = 0; i < 16 * 3; i++) {
            if ((i % 3) == 0)
                neopixel_buf[i] = Math.round(g)
            if ((i % 3) == 1)
                neopixel_buf[i] = Math.round(r)
            if ((i % 3) == 2)
                neopixel_buf[i] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)
    }

    /**
     * Set the brightness of RGB LED
     * @param brightness  , eg: 100
     */

    //% weight=70
    //% brightness.min=0 brightness.max=255
    //% block="set RGB brightness to |%brightness"
    //% group="Maqueen_v5"
    export function bottomSetBrightness(brightness: number) {
        _brightness = brightness;
    }

    /**
     * Turn off all RGB LEDs
     */

    //% weight=40
    //% block="clear all RGB"
    //% group="Maqueen_v5"
    export function bottomLedOff() {
        bottomShowColor(0)
    }

    /**
     * RGB LEDs display rainbow colors 
     */

    //% weight=50
    //% startHue.defl=1
    //% endHue.defl=360
    //% startHue.min=0 startHue.max=360
    //% endHue.min=0 endHue.max=360
    //% blockId=led_rainbow block="set RGB show rainbow color from|%startHue to|%endHue"
    //% group="Maqueen_v5"
    export function bottomLedRainbow(startHue: number, endHue: number) {
        startHue = startHue >> 0;
        endHue = endHue >> 0;
        const saturation = 100;
        const luminance = 50;
        let steps = 3 + 1;
        const direction = HueInterpolationDirection.Clockwise;

        //hue
        const h1 = startHue;
        const h2 = endHue;
        const hDistCW = ((h2 + 360) - h1) % 360;
        const hStepCW = Math.idiv((hDistCW * 100), steps);
        const hDistCCW = ((h1 + 360) - h2) % 360;
        const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
        let hStep: number;
        if (direction === HueInterpolationDirection.Clockwise) {
            hStep = hStepCW;
        } else if (direction === HueInterpolationDirection.CounterClockwise) {
            hStep = hStepCCW;
        } else {
            hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
        }
        const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

        //sat
        const s1 = saturation;
        const s2 = saturation;
        const sDist = s2 - s1;
        const sStep = Math.idiv(sDist, steps);
        const s1_100 = s1 * 100;

        //lum
        const l1 = luminance;
        const l2 = luminance;
        const lDist = l2 - l1;
        const lStep = Math.idiv(lDist, steps);
        const l1_100 = l1 * 100

        //interpolate
        if (steps === 1) {
            writeBuff(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
        } else {
            writeBuff(0, hsl(startHue, saturation, luminance));
            for (let i = 1; i < steps - 1; i++) {
                const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                const s = Math.idiv((s1_100 + i * sStep), 100);
                const l = Math.idiv((l1_100 + i * lStep), 100);
                writeBuff(0 + i, hsl(h, s, l));
            }
            writeBuff(3, hsl(endHue, saturation, luminance));
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    function writeBuff(index: number, rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        neopixel_buf[index * 3 + 0] = Math.round(g)
        neopixel_buf[index * 3 + 1] = Math.round(r)
        neopixel_buf[index * 3 + 2] = Math.round(b)
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;

        return (r << 16) + (g << 8) + b;
    }


}

