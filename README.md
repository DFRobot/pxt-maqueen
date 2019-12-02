 
# Maqueen

This is a MakeCode graphical programming education robot.

Author: tangjie  
Date:   2019.October  
  

## Add extension

open your microbit makecode project, in Extension, 
paste  (https://github.com/DFRobot/pxt-maqueen) to 
search box then search.

Get the module here  
(https://www.dfrobot.com.cn/goods-1802.html)
## Basic usage

* Set the motion direction and speed of Maqueen motor

```blocks
Maqueen.MotorRun(Maqueen.Motors.M1, Maqueen.Dir.CW, 120)
Maqueen.MotorRun(Maqueen.Motors.M2, Maqueen.Dir.CCW, 120)
```

* Read the Maqueen ultrasound data

```blocks
basic.showNumber(Maqueen.Ultrasonic(PingUnit.Centimeters))
```

* Set the  Maqueen servos 

```blocks
Maqueen.ServoRun(Maqueen.Servos.S1, 90)
```

* Set the  Maqueen  motor stop

```blocks
Maqueen.MotorStop(Maqueen.Motors.M1)
```

* Read patrol sensor data

```blocks
basic.showNumber(Maqueen.ReadPatrol(Maqueen.Patrol.PatrolLeft))
```

* Set LED light switch

```blocks
Maqueen.WriteLED(Maqueen.LED.LEDLeft, Maqueen.LEDswitch.turnOn)
```

* Read IR sensor data

```blocks
basic.showNumber(Maqueen.IR_read())
```

* Read the version number

```blocks
basic.showString(Maqueen.IR_read_version())
```

## License

MIT

Copyright (c) 2018, microbit/micropython Chinese community  


## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)
