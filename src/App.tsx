import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

export interface BullBear {
  steps: {
    amount: number;
    from: number;
    to: number;
    type: "bull" | "bear";
  }[];
  hsiLast: number;
  date: string;
}

const App: React.FC = () => {
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [data, setData] = useState<BullBear | null>(null);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const datesData: { dates: string[] } = await import("./dates.json");
        const parsedDates = datesData.dates.map((date) => new Date(date));
        setDates(parsedDates);

        if (parsedDates.length > 0) {
          setSelectedDate(parsedDates[parsedDates.length - 1]);
        }
      } catch (error) {
        console.error("Failed to load dates.json:", error);
      }
    };

    fetchDates();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const formattedDate = selectedDate.toISOString().split("T")[0];
    const fetchData = async () => {
      try {
        const jsonData: BullBear = await import(`./data/${formattedDate}.json`);

        const trimmedSteps = [
          ...jsonData.steps
            .filter((step) => step.type === "bear")
            .sort((a, b) => a.from - b.from)
            .slice(0, 10),
          ...jsonData.steps
            .filter((step) => step.type === "bull")
            .sort((a, b) => b.from - a.from)
            .slice(0, 10),
        ];

        setData({ ...jsonData, steps: trimmedSteps });
      } catch (error) {
        console.error(`No data found for date: ${formattedDate}`, error);
        setData(null);
      }
    };

    fetchData();
  }, [selectedDate]);

  const getMaxAmount = (type: "bull" | "bear") =>
    data
      ? Math.max(
          ...data.steps
            .filter((step) => step.type === type)
            .map((step) => step.amount)
        )
      : 0;

  const handleNextDate = () => {
    if (selectedDate && dates.length > 0) {
      const currentIndex = dates.findIndex(
        (date) => date.getTime() === selectedDate.getTime()
      );
      if (currentIndex < dates.length - 1) {
        setSelectedDate(dates[currentIndex + 1]);
      }
    }
  };

  const handlePreviousDate = () => {
    if (selectedDate && dates.length > 0) {
      const currentIndex = dates.findIndex(
        (date) => date.getTime() === selectedDate.getTime()
      );
      if (currentIndex > 0) {
        setSelectedDate(dates[currentIndex - 1]);
      }
    }
  };

  const sortedSteps = data
    ? [...data.steps]
        .sort((a, b) => b.from - a.from)
        .sort((a, b) => a.type.localeCompare(b.type))
    : [];

  const maxBullAmount = getMaxAmount("bull");
  const maxBearAmount = getMaxAmount("bear");

  return (
    <div className="app">
      <h1>牛熊歷史參考</h1>
      <div>
        <label htmlFor="date-picker">選擇日期: </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => {
            if (date) setSelectedDate(date);
          }}
          includeDates={dates}
          dateFormat="yyyy-MM-dd"
        />
        <button onClick={handlePreviousDate}>上一個日期</button>
        <button onClick={handleNextDate}>下一個日期</button>
      </div>

      {data ? (
        <>
          <div className="table">
            {sortedSteps
              .filter((step) => step.type === "bear")
              .map((step, index) => (
                <div key={index} className={`table-row ${step.type}`}>
                  <span style={{ width: "120px" }}>
                    {step.from} - {step.to}
                  </span>
                  <div
                    className="bar"
                    style={{ width: `${step.amount / 10}px` }}
                  ></div>
                  <span style={{ width: "80px" }}>{step.amount}</span>
                  {step.amount ===
                    (step.type === "bull" ? maxBullAmount : maxBearAmount) && (
                    <span style={{ width: "80px" }}>重貨區</span>
                  )}
                </div>
              ))}
          </div>

          <p>上日收市價 {data.hsiLast}</p>

          <div className="table">
            {sortedSteps
              .filter((step) => step.type === "bull")
              .map((step, index) => (
                <div key={index} className={`table-row ${step.type}`}>
                  <span style={{ width: "120px" }}>
                    {step.from} - {step.to}
                  </span>
                  <div
                    className="bar"
                    style={{ width: `${step.amount / 10}px` }}
                  ></div>
                  <span style={{ width: "80px" }}>{step.amount}</span>
                  {step.amount ===
                    (step.type === "bull" ? maxBullAmount : maxBearAmount) && (
                    <span style={{ width: "80px" }}>重貨區</span>
                  )}
                </div>
              ))}
          </div>
        </>
      ) : (
        <p>無法加載數據。請檢查日期是否正確。</p>
      )}

      <style>{`
        .app {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .table {
          border: 1px solid #ccc;
          margin-top: 20px;
        }
        .table-row {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          padding: 10px;
        }
        .bar {
          height: 20px;
          background-color: lightblue;
          margin: 0 10px;
        }
        .bull {
          color: #155724;
          background-color: #d4edda;
        }
        .bear {
          color: #721c24;
          background-color: #f8d7da;
        }
      `}</style>
    </div>
  );
};

export default App;
