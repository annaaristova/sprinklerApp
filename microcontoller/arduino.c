#include <avr/io.h>
#include <util/delay.h>

#define BAUD_RATE 9600

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

  DDRB |= (1 << 5);
  UART_Init(BAUD_RATE); 

  while(1){
    //wait for the first byte
    while((UCSR0A & (1 << RXC0)) != (1 << RXC0));
    //read less significant byte from the buffer
    int lsb = UDR0; 

    //use delay to wait for the second byte
    _delay_ms(50);

    //if the second byte is not received during the 50-millisecond delay,
    //dismiss the first byte and return to the beginning of the loop
    if((UCSR0A & (1 << RXC0)) != (1 << RXC0)){
      continue;
    };
    //read most significant byte from the buffer
    int msb = UDR0; 
    
    //recreate the number
    unsigned int duration = msb << 8 | lsb;

    PORTB |= (1 << 5);
    for (int i=0; i < duration; i++){
      _delay_ms(1);
    }
    PORTB &= ~(1 << 5);

  }
  return 0;
}
