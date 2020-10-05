const SerialPort = require('serialport')

var forward_m1 = 0x00,
    reverse_m1 = 0x01,
    forward_m2 = 0x04,
    reverse_m2 = 0x05,
    forward_mixed = 0x08,
    reverse_mixed = 0x09,
    right_mixed = 0x0A,
    left_mixed = 0x0B,
    ramp = 0x10;


class Sabertooth {
    constructor(port, baudRate, address) {
        this.address = address || 128;
        this.baudRate = baudRate;
        this.mask = 127;
        this.serial = new SerialPort(port, {
            baudRate: this.baudRate
        })
    }
    update(command, data) {
        this.command = command;
        this.data = data;
        let checksum = ((this.address + this.command + this.data) & this.mask);
        let newUpdate = Buffer.from([this.address, this.command, this.data, checksum]);
        this.serial.write(newUpdate);
    }
    // Drive a specific motor. Example: Sabertooth.drive(1, 40) for motor 1 at a speed of 40.
    drive(num, speed) {
        var cmds = [forward_m1, forward_m2]

        try {
            this.cmd = cmds[num - 1]
        } catch (error) {
            console.log("PySabertooth, invalid motor number:" + num);
        }
        if (speed < 0) {
            speed = -speed;
            // reverse commands are equal to forward + 1 (thanks, hexadecimal)
            this.cmd += 1
        }
        if (speed > 100) {
            console.log('Invalid Speed: ' + speed)
        }
        console.log(this.cmd)
        this.update(this.cmd, 127 * speed / 100)
    }
    // Sabertooth.driveBoth: Drive both motors at different speeds in one command.
    driveBoth(speed1, speed2) {
        this.drive(1, speed1)
        this.drive(2, speed2)
    }
    // Sabertooth.driveTank: Drive both motors at the same speed
    driveTank(speed) {
        this.drive(1, speed)
        this.drive(2, speed)
    }
    // Sabertooth.stop: Stop both motors. 
    stop() {
        this.drive(1, 0)
        this.drive(2, 0)
    }
}

module.exports = { Sabertooth }
