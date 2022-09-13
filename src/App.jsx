import { useEffect, useMemo } from "react";
import { useLocalStorage } from "react-use";
import styled, { createGlobalStyle } from "styled-components";

import Home from "./components/Home";

import TasksContext from "./contexts/TasksContext";
import DayContext from "./contexts/DayContext";
import DaysContext from "./contexts/DaysContext";
import CashContext from "./contexts/CashContext";
import WithdrawalsContext from "./contexts/WithdrawalsContext";

import "antd/dist/antd.css";

const StyledApp = styled.div`
  ${(props) =>
    props.isToday &&
    `
    background: #efe6b3;
    min-height: 100vh;
  `}
`;

const GlobalStyle = createGlobalStyle`
 .ant-list-sm .ant-list-item {
  padding: 8px 0
 }

@media screen and (max-width: 40em) {
  .ant-drawer-right.ant-drawer-open .ant-drawer-content-wrapper {
    max-width: 100%;
  }
}`;

const App = () => {
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [days, setDays] = useLocalStorage("days", []);
  const [date, setDate] = useLocalStorage("date", null);
  const [cash, setCash] = useLocalStorage("cash", { current: 0, total: 0 });
  const [withdrawals, setWithDrawals] = useLocalStorage("withdrawals", []);

  // Create first entry in days array
  useEffect(() => {
    if (!days.length) {
      const today = {
        date: new Date().toISOString(),
        dailyTasks: [],
        cash: 0,
      };
      setDays([today]);
      setDate(today.date);
    }
  }, [days]);

  const isToday = useMemo(
    () => new Date(date).toDateString() === new Date().toDateString(),
    [date]
  );

  return (
    <StyledApp className="App" isToday={isToday}>
      <GlobalStyle />
      <TasksContext.Provider value={[tasks, setTasks]}>
        <DayContext.Provider value={[date, setDate]}>
          <DaysContext.Provider value={[days, setDays]}>
            <CashContext.Provider value={[cash, setCash]}>
              <WithdrawalsContext.Provider
                value={[withdrawals, setWithDrawals]}
              >
                <Home />
              </WithdrawalsContext.Provider>
            </CashContext.Provider>
          </DaysContext.Provider>
        </DayContext.Provider>
      </TasksContext.Provider>
    </StyledApp>
  );
};

export default App;
