import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import partition from "lodash/partition";

import AppHeader from "./components/AppHeader";
import AddEditTaskModal from "./components/AddEditTaskModal";
import AddEditTagModal from "./components/AddEditTagModal";
import AddEditSubtaskModal from "./components/AddEditSubtaskModal";
import AllTasks from "./components/AllTasks";
import DateCard from "./components/DateCard";
import DeleteDataModal from "./components/DeleteDataModal";

import TasksContext from "./contexts/TasksContext";
import SubtasksContext from "./contexts/SubtasksContext";
import TagsContext from "./contexts/TagsContext";
import DateContext from "./contexts/DateContext";
import DaysContext from "./contexts/DaysContext";
import CashContext from "./contexts/CashContext";
import WithdrawalsContext from "./contexts/WithdrawalsContext";

import "antd/dist/reset.css";
import "./App.css";

const App = () => {
  // Set up defaults for contexts
  // These values are only used if nothing is in localStorage
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [subtasks, setSubtasks] = useLocalStorage("subtasks", []);
  const [tags, setTags] = useLocalStorage("tags", []);

  const [date, setDate] = useLocalStorage(
    "date",
    new Date().toLocaleDateString()
  );
  const [days, setDays] = useLocalStorage("days", [
    {
      date: new Date().toLocaleDateString(),
      dailyTasks: [],
      dailySubtasks: [],
      cash: 0,
    },
  ]);

  const [cash, setCash] = useLocalStorage("cash", { current: 0, total: 0 });
  const [withdrawals, setWithDrawals] = useLocalStorage("withdrawals", []);

  // State vars to control display of modals, drawers
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSubtaskModalVisible, setIsSubtaskModalVisible] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);

  // Memoize grouped lists of tasks
  const groupedTasks = useMemo(() => {
    return partition(tasks, "permanent").reverse();
  }, [tasks, days]);

  useEffect(() => console.log("subtasks changed", subtasks), [subtasks]);
  useEffect(() => console.log("cash changed", cash), [cash]);
  useEffect(() => console.log("tasks changed", tasks), [tasks]);
  useEffect(() => console.log("days changed", days), [days]);
  useEffect(() => console.log("date changed", date), [date]);
  useEffect(() => console.log("tags changed", tags), [tags]);
  useEffect(
    () => console.log("selectedSubtasks changed", selectedSubtasks),
    [selectedSubtasks]
  );
  useEffect(
    () => console.log("isSubtaskModalVisible changed", isSubtaskModalVisible),
    [isSubtaskModalVisible]
  );
  useEffect(
    () => console.log("withdrawals changed", withdrawals),
    [withdrawals]
  );
  useEffect(
    () => console.log("selectedTag changed", selectedTag),
    [selectedTag]
  );
  useEffect(
    () => console.log("selected task changed", selectedTask),
    [selectedTask]
  );
  useEffect(
    () => console.log("isAddTaskModalVisible changed", isAddTaskModalVisible),
    [isAddTaskModalVisible]
  );

  const setAddModalVisibility = (isVisible) =>
    setIsAddTaskModalVisible(isVisible);
  const setTask = (task) => setSelectedTask(task);
  const setTagModalVisibility = (isTagModalVisible) =>
    setIsTagModalVisible(isTagModalVisible);
  const setTag = (tag) => setSelectedTag(tag);
  const setDeleteVisibility = (isVisible) => setIsDeleteModalVisible(isVisible);
  const setSubtaskModalVisibility = (isVisible) =>
    setIsSubtaskModalVisible(isVisible);
  const setCurrentSubtasks = (subtasks) => setSelectedSubtasks(subtasks);

  return (
    <>
      <TasksContext.Provider
        value={{
          tasks,
          setTasks,
          subtasks,
          setSubtasks,
          selectedTask,
          isAddTaskModalVisible,
          setAddModalVisibility,
          setTask,
        }}
      >
        <SubtasksContext.Provider
          value={{
            subtasks,
            setSubtasks,
            setSubtaskModalVisibility,
            isSubtaskModalVisible,
            setCurrentSubtasks,
            selectedSubtasks,
          }}
        >
          <TagsContext.Provider
            value={{
              tags,
              setTags,
              setTagModalVisibility,
              isTagModalVisible,
              setTag,
              selectedTag,
            }}
          >
            <DateContext.Provider value={[date, setDate]}>
              <DaysContext.Provider value={[days, setDays]}>
                <CashContext.Provider value={[cash, setCash]}>
                  <WithdrawalsContext.Provider
                    value={[withdrawals, setWithDrawals]}
                  >
                    <AppHeader setDeleteVisibility={setDeleteVisibility} />
                    <DateCard />
                    <AddEditTaskModal />
                    <AddEditTagModal />
                    <AddEditSubtaskModal />
                    <AllTasks groupedTasks={groupedTasks} />
                    <DeleteDataModal
                      isDeleteModalVisible={isDeleteModalVisible}
                      setDeleteVisibility={setDeleteVisibility}
                    />
                  </WithdrawalsContext.Provider>
                </CashContext.Provider>
              </DaysContext.Provider>
            </DateContext.Provider>
          </TagsContext.Provider>
        </SubtasksContext.Provider>
      </TasksContext.Provider>
    </>
  );
};

export default App;
