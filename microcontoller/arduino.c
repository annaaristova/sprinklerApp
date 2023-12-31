#include <avr/io.h>
#include <util/delay.h>

#define BAUD_RATE 9600

#define BYTE_RECEIVED ((UCSR0A & (1 << RXC0)) == (1 << RXC0))

void UART_Init(long int baudRate){

  //set UCSR0A register bits to 0
  UCSR0A = 0x00; 

  //writing RXEN0 bit to one enables the USART receiver
  UCSR0B = (1 << RXEN0);

  //set UCSZ01 and UCSZ00 bits to 1 to set 8 bit mode
  UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);

  int baudRateDivider = (F_CPU/(baudRate * 16UL)) - 1;

  //the UBRRnH contains the four most significant bits, and the 
  //UBRRnL contains the eight least significant bits of the USART baud rate
  UBRR0L = baudRateDivider & 0xFF;
  UBRR0H = baudRateDivider >> 8;

}

int main(){

  //set CLKPR in CLKPR register to 1 and the rest bits to 0
  //set CLKPS2 to 1 to decrease the frequency of the microcontroller to 1 MHz 
  //https://bletvaska.gitbooks.io/advanced-iot-applications/content/en/chapter-2/clock.frequency.html
  CLKPR = (1 << CLKPCE);
  CLKPR = (1 << CLKPS2);

  //set PB3 (pump) and PB4 (conv en/dis) to 1 (output state) 
  DDRB |= (1 << 3) | (1 << 4);
  UART_Init(BAUD_RATE); 

  unsigned int PwbnkOn = 0;
  unsigned int pumpRunTimer;
  int bytes[2];
  int PumpRun = 0;
  int byteTimeOut = 0; 
  int index = 0;

  while(1){
    _delay_ms(1);
    
    //count milliseconds to send a signal every 40000 so the powerbank stays active
    PwbnkOn++;

    if (PwbnkOn == 40000){
      //use PORTB to set the pin into the high state
      PORTB |= (1 << 3);
    }

    if (PwbnkOn == 40001){
      //use PORTB to set the pin into the low state
      PORTB &= ~(1 << 3);
      PwbnkOn = 0;
    }

    
    if (BYTE_RECEIVED){
      if(index == 2){
        index = 0;
        PORTB &= ~(1 << 3);
        PORTB &= ~(1 << 4);
        PumpRun = 0;
      }
      bytes[index] = UDR0;
      index++;
    }

    if (index == 1){
      byteTimeOut++;
    }

    //if the second byte was received in 50mls set the index to 0 
    if (index == 1 && byteTimeOut == 50){
      index = 0;
      byteTimeOut = 0;
    }

    if (index == 2){
      pumpRunTimer = bytes[1] << 8 | bytes[0];
      PORTB |= (1 << 3);
      PORTB |= (1 << 4);
      PumpRun++;
    }

    if (PumpRun == pumpRunTimer){
        PORTB &= ~(1 << 3);
        PORTB &= ~(1 << 4);
        PumpRun = 0;
        index = 0;
    }
  }
  return 0;
}
