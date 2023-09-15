BIN=sprinkle
OBJS=arduino.o

MCU=atmega328p
CC=avr-gcc
OBJCOPY=avr-objcopy
CFLAGS=-Os -DF_CPU=16000000UL -mmcu=${MCU}
PORT=/dev/ttyS3


${BIN}.hex: ${BIN}.elf
	${OBJCOPY} -O ihex -R .eeprom $< $@

${BIN}.elf: ${OBJS}
	${CC} -o $@ $^

install: ${BIN}.hex
	avrdude -c arduino -p ${MCU} -P ${PORT} -b 57600 -U flash:w:$<

clean:
	rm -f ${BIN}.elf ${BIN}.hex ${OBJS}