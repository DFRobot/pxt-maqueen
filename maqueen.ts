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

    let state1 = 0;
    /**
     * Read ultrasonic sensor.
     */

    //% blockId=ultrasonic_sensor block="read ultrasonic sensor in cm"
    //% weight=95
    export function Ultrasonic(): number {
        let data;
        let i = 0;
        data = readUlt(PingUnit.Centimeters);
        if (state1 == 1 && data != 0) {
            state1 = 0;
        }
        if (data != 0) {
        } else {
            if (state1 == 0) {
                do {
                    data = readUlt(PingUnit.Centimeters);
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
     * @param index Motor to run
     * @param direction Wheel direction
     * @param speed Wheel speed
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
     * @param motors The motor to stop
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
     * @param patrol The patrol sensor to read
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
     * @param led The LED to operate
     * @param ledswitch The operation to perform
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
     * @param index Servo channel
     * @param angle Servo angle; eg: 90
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
    * @param value Sensor
    * @param vi Voltage
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
//% weight=100 color=#0fbc11 icon="\uf48b" block="Maqueen v5"
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
        //% blockId="patrolLeft" block="L"
        L = 1,
        //% blockId="patrolMiddle" block="M"
        M = 2,
        //% blockId="patrolRight" block="R"
        R = 3
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

    export enum DirectionType2 {
        //% block="left led light"
        Left = 0,
        //% block="right led light"
        Right = 1,
    }
    export enum BatteryType {
        //% block="Alkaline battery"
        Alkaline = 1,
        //% block="Lithium battery"
        Lithium = 0,
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
    export const enum BleCmd {
        //% block="Go forward"
        BleForward = 1,         /**< advance */
        //% block="Go backward"
        BleBackward = 2,         /**< astern */
        //% block="Turn left"
        BleLeft = 3,             /**< turn left */
        //% block="Turn right"
        BleRight = 4,           /**< turn right */
        //% block="RGB red"
        BleRgbR = 5,           /**< Red */
        //% block="RGB green"
        BleRgbG = 6,            /**< Green */
        //% block="RGB blue"
        BleRgbB = 7,           /**< Blue */
        //% block="RGB purple"
        BleRgbRB = 8,          /**< Purple */
        //% block="RGB yellow"
        BleRgbRG = 9,          /**< Yellow */
        //% block="RGB cyan"
        BleRgbGB = 10,         /**< Cyan */
        //% block="RGB white"
        BleRgbRGB = 11,        /**< White */
        //% block="RGB OFF"
        BleRgbOff = 12,        /**< Off */
        //% block="Turn servo1 right"
        BleServo1Right = 13,   /**< servo1 turn right */
        //% block="Turn servo1 left"
        BleServo1Left = 14,     /**< servo1 turn left */
        //% block="Turn servo2 right"
        BleServo2Right = 15,    /**< servo2 turn right */
        //% block="Turn servo2 left"
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
     const  BLEEN                     = 81
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
     * @param patrol to patrol
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
    //% weight=254
    //% blockId=patrolSpeed block="set the speed of Line patrol| %PatrolSpeed"
    //% group="Maqueen_v5"
    export function patrolSpeed(speed: PatrolSpeed) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = LINE_SPEED_GRADE;
        allBuffer[1] = speed;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }
    */


    /**
     * Control motor module running
     * @param index Motor selection enumeration
     * @param direction Motor direction selection enumeration
     * @param speed Motor speed control, eg:100
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

    let state1 = 0;

    /**
     * Read ultrasonic sensor（uint cm）.
     */

    //% blockId=V5_ultrasonic_sensor block="read ultrasonic sensor"
    //% weight=95
    //% group="Maqueen_v5"
    export function Ultrasonic(): number {
        let data;
        let i = 0;
        data = readUlt(PingUnit.Centimeters);
        if (state1 == 1 && data != 0) {
            state1 = 0;
        }
        if (data != 0) {
        } else {
            if (state1 == 0) {
                do {
                    data = readUlt(PingUnit.Centimeters);
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
     * @param motors Motor selection enumeration
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
     * Get the state of the patrol sensor. placing the cart on white paper returns 0 and placing the cart on air/black paper returns 1
     * @param patrol Select the inspection sensor enumeration
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
     * @param patrol Select the inspection sensor enumeration
     */
    //% weight=21
    //% blockId= readPatrolData block="read line sensor |%Patrol  ADC data"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2
    //% group="Maqueen_v5"
    export function readPatrolData(patrol: Patrol): number {
        let data;
        switch (patrol) {
            case Patrol.L:
                pins.i2cWriteNumber(I2CADDR, ADC_COLLECT_1, NumberFormat.Int8LE);
                let adc0Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc0Buffer[0] << 8 | adc0Buffer[1]
                break;
            case Patrol.M:
                pins.i2cWriteNumber(I2CADDR, ADC_COLLECT_2, NumberFormat.Int8LE);
                let adc1Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc1Buffer[0] << 8 | adc1Buffer[1];
                break;
            case Patrol.R:
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
     * Control the Maqueen steering Angle(0-180)
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
     * @param type to type
     * @param rgb to rgb
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
     * @param type to type
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
     * @param type to type
     * @param grade Select the speed level enumeration
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
     * @param type to type
     */
    //% block="Close |%type RGB Car Lights  "
    //% weight=11
    //% group="Maqueen_v5"
    export function setRgbOff(type: DirectionType) {
        setRgblLed(type,CarLightColors.Black);
    }
    /**
     * Reading light intensity(0-1023)
     */
    //% block="Read Light Values %type"
    //% weight=16
    //% group="Maqueen_v5"
    export function readLightIntensity(type: DirectionType2): number {
        let allBuffer = pins.createBuffer(2);
        if (type == DirectionType2.Left){
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
     * Getting battery level(0-100)
     * @param type Battery type
     */
    //% block="Read battery Values %type"
    //% weight=16
    //% group="Maqueen_v5"
    export function getBatteryData(type: BatteryType = BatteryType.Alkaline): number {
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
    // // /**
    // //  *  Enable or disable BLE
    // //  */
    // // //% block="Bluetooth of Maqueen_v5  %cmd"
    // // //% weight=5
    // // //% group="Maqueen_v5"
    // export function BleModule(cmd: Patrolling) {
    //     let allBuffer = pins.createBuffer(2);
    //     allBuffer[0] = BLEEN;
    //     allBuffer[1] = cmd;
    //     pins.i2cWriteBuffer(I2CADDR, allBuffer);
    // }
    // /**
    //  *  Bluetooth of Maqueen V5 commands control the configuration by default
    //  * @param Received Bluetooth command
    //  */
    // //% block="Maqueen_v5 Default Bluetooth command control %cmd"
    // //% weight=1
    // //% group="Maqueen_v5"
    // export function BleCmdDefault(cmd: number){
    //     switch (cmd) {
    //         case BleCmd.BleForward:
    //             motorRun(Motors.All, Dir.CW,100);
    //             basic.pause(100);
    //             motorRun(Motors.All, Dir.CW, 0);
    //             break;
    //         case BleCmd.BleBackward:
    //             motorRun(Motors.All, Dir.CCW, 100);
    //             basic.pause(100);
    //             motorRun(Motors.All, Dir.CCW, 0);
    //             break;
    //         case BleCmd.BleLeft:
    //             motorRun(Motors.M2, Dir.CCW, 100);
    //             basic.pause(100);
    //             motorRun(Motors.All, Dir.CCW, 0);
    //             break;
    //         case BleCmd.BleRight:
    //             motorRun(Motors.M1, Dir.CCW, 100);
    //             basic.pause(100);
    //             motorRun(Motors.All, Dir.CCW, 0);
    //             break;
    //         case BleCmd.BleRgbR:
    //             setRgblLed(DirectionType.All, CarLightColors.Red);
    //             break;
    //         case BleCmd.BleRgbG:
    //             setRgblLed(DirectionType.All, CarLightColors.Green);
    //             break;
    //         case BleCmd.BleRgbB:
    //             setRgblLed(DirectionType.All, CarLightColors.Blue);
    //             break;
    //         case BleCmd.BleRgbRB:
    //             setRgblLed(DirectionType.All, CarLightColors.Purple);
    //             break;
    //         case BleCmd.BleRgbRG:
    //             setRgblLed(DirectionType.All, CarLightColors.Yellow);
    //             break;
    //         case BleCmd.BleRgbGB:
    //             setRgblLed(DirectionType.All, CarLightColors.Cyan);
    //             break;
    //         case BleCmd.BleRgbRGB:
    //             setRgblLed(DirectionType.All, CarLightColors.White);
    //             break;
    //         case BleCmd.BleRgbOff:
    //             setRgblLed(DirectionType.All, CarLightColors.Black);
    //             break;
    //         case BleCmd.BleServo1Right:
    //             if (servo1_num < 180) servo1_num += 5;
    //             servoRun(Servos.S1, servo1_num);
    //             break;
    //         case BleCmd.BleServo1Left:
    //             if (servo1_num > 0) servo1_num -= 5;
    //             servoRun(Servos.S1, servo1_num);
    //             break;
    //         case BleCmd.BleServo2Right:
    //             if (servo2_num <= 180) servo2_num += 5;
    //             servoRun(Servos.S2, servo2_num);
    //             break;
    //         case BleCmd.BleServo2Left:
    //             if (servo2_num > 0) servo2_num -= 5;
    //             servoRun(Servos.S2, servo2_num);
    //             break;
    //         default:
    //             break;
    //     }

    // }

    // /**
    //  * Get commands from Bluetooth of Maqueen V5
    //  */
    // let Ble_state: number;
    // let Ble_cmd: number;
    // //% block="get Bluetooth commands"
    // //% weight=3
    //  //% group="Maqueen_v5"
    // export function BleGetCmd(): number {
    //     let allBuffer = pins.createBuffer(2);
    //     pins.i2cWriteNumber(I2CADDR, BLECMD, NumberFormat.Int8LE);
    //     allBuffer = pins.i2cReadBuffer(I2CADDR, 1);
    //     let temp_data = allBuffer[0];
    //     return temp_data;
    // }
    // /**
    //  * When Bluetooth data from Maqueen V5 is received
    //  * @param value describe value here, eg: 5
    //  */
    // //% weight=2
    // //% block="When received"
    // //% draggableParameters
    // //% group="Maqueen_v5"
    // export function BlecallbackUser(cb: (Blecmd: number) => void) {
    //     Ble_state = 1;
    //     control.onEvent(33, 44, function () {
    //         cb(Ble_cmd)
    //     })
    // }

    // basic.forever(() => {
    //     if (Ble_state == 1) {
    //         Ble_cmd = BleGetCmd();
    //         if (Ble_cmd != 0) {
    //             control.raiseEvent(33, 44)
    //         }
    //     }
    //     basic.pause(50);
    // })


}

