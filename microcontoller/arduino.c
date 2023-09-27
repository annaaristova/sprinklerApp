#include <avr/io.h>

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
    //Check if the byte was received 
    if ((UCSR0A & (1 << RXC0)) == (1 << RXC0)){
    //read from the buffer
      char readByte = UDR0;
      if (readByte == '1'){
        PORTB |= (1 << 5);
      } 
      else if (readByte == '0') {
        PORTB &= ~(1 << 5);
      }
      else if (readByte == '2') {
        PORTB ^= (1 << 5);
      }
    }
  }
  return 0;
}
