import dayjs from "dayjs";
import 'dayjs/locale/pt-br';

import { useContext, useEffect, useState } from "react";

import styled from "styled-components";
import UserContext from "../../contexts/UserContext";
import { GetTodayHabits, SetHabitChecked } from "../../requests";
import Habit from "./Habit";
import LoadingBlocks from "../../Components/LoadingBlocks";
import { useNavigate } from "react-router-dom";



export default function TodayPage() {
    const { user, setUser, completedHabits, setCompletedHabits } = useContext(UserContext);
    const [todayHabits, setTodayHabits] = useState(null);
    const [changingHabitState, setChangingHabitState] = useState(false);
    const navigate = useNavigate();


    function UpdateHabits(habistArr, error) {
        if (error === true) {
            navigate('/error');
            return;
        }

        setTodayHabits(habistArr);
        setCompletedHabits((habistArr.filter((habit) => habit.done).length / habistArr.length) * 100);
    }

    function toggle(id) {
        if(changingHabitState)
        {
            return;
        }

        todayHabits.find((habit) => habit.id === id).done ? uncheckHabit(id) : checkHabit(id);
        setChangingHabitState(true);
    }

    useEffect(() => {
        if (localStorage.getItem('user-trackit')) {
            const lsUser = JSON.parse(localStorage.getItem('user-trackit'));
            setUser(lsUser);
            GetTodayHabits({ headers: { Authorization: `Bearer ${lsUser.token}` } }, UpdateHabits);
            return;
        }

        GetTodayHabits({ headers: { Authorization: `Bearer ${user.token}` } }, UpdateHabits);

    }, []);

    function checkHabit(id) {
        SetHabitChecked(id, true, { headers: { Authorization: `Bearer ${user.token}` } }, checkEnded);
    }

    function uncheckHabit(id) {
        SetHabitChecked(id, false, { headers: { Authorization: `Bearer ${user.token}` } }, checkEnded);
    }

    function checkEnded(resp) {
        GetTodayHabits({ headers: { Authorization: `Bearer ${user.token}` } }, UpdateHabits);
        setChangingHabitState(false);
    }



    return (
        <TodayContainer amount={completedHabits.toFixed()}>
            <div className="header">
                <h1 data-test="today" >{dayjs().locale('pt-br').format('dddd, DD/MM')}</h1>
                {todayHabits != null && todayHabits.length > 0 && completedHabits > 0 && <p data-test="today-counter" className="habits-done">{completedHabits.toFixed()}% dos hábitos concluídos</p>}
                {todayHabits != null && todayHabits.length > 0 && completedHabits === 0 && <p data-test="today-counter" className="habits-done"> Nenhum hábito concluído ainda</p>}
            </div>
            <div className="today-habits">
                {todayHabits != null && todayHabits.length > 0 && todayHabits.map((habit) => <Habit loading={changingHabitState.toString()} key={habit.id} habit={habit} handleClick={() => toggle(habit.id)} />)}
                {todayHabits == null && <div className="text-no-habits"><p>Carregando...</p></div>}
                {todayHabits === null && <LoadingBlocks />}
                {todayHabits != null && todayHabits.length == 0 && <div className="text-no-habits"><p>Você não tem habitos para hoje</p></div>}
            </div>
        </TodayContainer>
    );
}


const TodayContainer = styled.div`
    
    min-height: 100svh;
    background-color: #E5E5E5;
    .header {
        padding-top: 98px;
        h1 {
            
            font-family: 'Lexend Deca';
            font-style: normal;
            font-weight: 400;
            font-size: 23px;
            color: rgba(18, 107, 165, 1);
            text-transform: capitalize;
            margin: 0 0 5px 17px;
        }
    
        .habits-done {
            font-family: 'Lexend Deca';
            font-style: normal;
            font-weight: 400;
            font-size: 18px;
            color: ${props => props.amount == 0 ? '#BABABA' : 'rgba(143, 197, 73, 1)'};
            margin: 0 0 28px 17px;
        }
    }

    .today-habits {
        display: flex;
        flex-direction: column;
        align-items: center;
    
    .text-no-habits {
        position: absolute;
        left: 0;
        margin-top: 10px;
        margin-left: 17px;
        font-family: 'Lexend Deca';
        font-style: normal;
        font-weight: 400;
        font-size: 18px;
        color: #BABABA;
    }

        
    }

    .habits-done {
        color: #8FC549;
        padding-top: 10px;
    }
`;