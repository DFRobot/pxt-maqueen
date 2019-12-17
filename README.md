 
# Maqueen

[Maqueen is an easy-to-use programming educational Robot](https://www.dfrobot.com.cn/goods-1802.html)

## Basic usage

* Set the direction and speed of Maqueen motor

```blocks
 maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 120)
 maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, 120)
```

* Read ultrasonic sensor

```blocks
basic.showNumber(maqueen.Ultrasonic(PingUnit.Centimeters))
```

* Set the  Maqueen servos 

```blocks
maqueen.servoRun(maqueen.Servos.S1, 90)
```

* Stop the Maqueen motor 

```blocks
maqueen.motorStop(maqueen.Motors.M1)
```

* Read line tracking sensor

```blocks
serial.writeNumber(maqueen.readPatrol(maqueen.Patrol.PatrolLeft))
```

* Turn on/off the LEDs

```blocks
maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOn)
```

* Read IR sensor value

```blocks
basic.showNumber(maqueen.IR_read())
```

* Read the version number

```blocks
basic.showString(maqueen.IR_read_version())
```

## License

MIT

Copyright (c) 2018, microbit/micropython Chinese community  


## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)
