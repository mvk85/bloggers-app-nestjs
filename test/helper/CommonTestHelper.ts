import { addMinutes } from 'date-fns';

export class CommonTestHelper {
  checkErrors(errors: any[]) {
    const errorSchema = {
      field: expect.any(String),
      message: expect.any(String),
    };

    errors.forEach((e) => {
      expect(e).toEqual(errorSchema);
    });
  }

  randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  generateDates() {
    const currentDate = new Date();

    return [
      addMinutes(currentDate, -5),
      addMinutes(currentDate, -15),
      addMinutes(currentDate, -20),
      addMinutes(currentDate, -25),
      addMinutes(currentDate, -30),
      addMinutes(currentDate, -35),
      addMinutes(currentDate, -40),
      addMinutes(currentDate, -45),
      addMinutes(currentDate, -50),
      addMinutes(currentDate, -55),
    ];
  }
}
