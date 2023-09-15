void setup() {
  // put your setup code here, to run once:
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
  if (Serial.available() > 0){
    char readByte = Serial.read();
    if (readByte == '1'){
      digitalWrite(13, HIGH);
    } 
    else if (readByte == '0') {
      digitalWrite(13, LOW);
    }
    else if (readByte == '2') {
      int val = digitalRead(13); 
      if (val == 1){
        digitalWrite(13, LOW);
      }
      else {
        digitalWrite(13, HIGH);
      }
    }
  }
}
