import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// If the game session has not yet started (i.e. have not advanced to the first question) a screen can exist that just says "Please wait".
// Once advanced onto at least the first question, users are now on a screen that gives the current question being asked. This consists of:

// The question text
// A video or image depending on whether it exists.
// A countdown with how many seconds remain until you can't answer anymore.
// A selection of single, multiple or judgement answers, that are clickable.

// The answer shall be sent to the server immediately after each user interaction. If further selections are modified, more requests are sent
// When the timer hits 0, the answer/results of that particular question are displayed
// The answer screen remains visible until the admin advances the game question onto the next question.
// Note: Once the game session begins (onto the first question or more) NO other players can join.

function CountdownTimer({ duration, onExpire }) {
    const [secondsLeft, setSecondsLeft] = useState(duration);
  
    useEffect(() => {
      if (secondsLeft <= 0) {
        if (onExpire) onExpire();
        return;
      }
  
      const interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
  
      return () => clearInterval(interval);
    }, [secondsLeft, onExpire]);
  
    return <div className="absolute top-20 right-4 px-6 py-3 text-black text-8xl font-extrabold z-50">
    {secondsLeft}
  </div>
  }


function Play({ playerId }) {

  const navigate = useNavigate();
  const [isPlayerValid, setIsPlayerValid] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState('');
  const [image, setImage] = useState('');
  const [answers, setAnswers] = useState([]);
  const [question, setQuestion] = useState('');
  const [timesUp, setTimesUp] = useState(false);




  playerId = 130896241;
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    console.log(storedPlayerId);
    if (!storedPlayerId) {
      alert("Please join a game first");
      navigate('/join');
    } else {
      setIsPlayerValid(true);
    }
  }, [navigate]); 

  useEffect(() => {
    if (isPlayerValid && playerId) {
      currState();
    }
  }, [isPlayerValid, playerId]);

  const currState = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/status`);
      console.log(response.data.started);
      if (response.data.started) {
        console.log("get question number");
        try {
                const response = await axios.get(`http://localhost:5005/play/${playerId}/question`, {
                });
                console.log(response.data);
                setHasStarted(true);
                setDuration(response.data.question.duration);
                setImage("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxIQEhUSEhIVFRUXFhgZFRUVGBUYFhgXGBgYGBkZFx0YHSggGB0nHhcYITEhJiorLi4uFyMzODMtNyguLisBCgoKDg0OGxAQGy0lICYuLS03LTUvLS0tLS0tLS0tLS8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAKEBOQMBEQACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAAABgQFBwMCAQj/xABUEAACAQMCAwUEBgUEDwUJAQABAgMABBEFIQYSMQcTQVFhIjJxgRRCUmKRoRUjM3Kxc4KywRckJTRDU1WSlKKzwtLh8GN0k6TRFiZUZIOE09TxCP/EABsBAQACAwEBAAAAAAAAAAAAAAAFBgEDBAIH/8QAPBEAAgEDAQUECQEHBAMBAAAAAAECAwQRBRIhMUFRE2FxoQYUIjKBkbHB0eEVNEJTYnLwIyQzUoKSokP/2gAMAwEAAhEDEQA/ANxoAoAoAoAoAoAoAoAoAoAoAoAoAoAoDLu1PiW8S8tdNtZRai4Xme5I33LKEQno3s+G5LoMjx03FZUaUqjWcLOEeox2ngS+MeFlt5LFUubma7muo1V5pCxABGSB9XDMm+aiNI1OtezltRSilyN1alGml1P0LU6c4UAUAUAUAUAUAUAUAUAmdrPEkmnae0kBxNI6xRHGcM2SSB4kKrY9cUAmcCQXVhrMdrPdzXAms2du8d2HeBsnAYnpyHB64auCwvY3lNzisYbRsqU9h4NmrvNYUAUBjtrxvrck108EFvcQQ3UsPdnKS4Q7cp5gDsR5n0rhudRt7eoqdV4bWTZGlKSykPPAXGK6rFI3cPBJC/dyoxDAPjcKwxn5gV2pprKNY01kBQBQBQBQBQBQBQBQBQBQBQBQBQBQBQHwmgPtAFAFAIHGvadFpV9FazQsyPGHkmVt4wzMowmPbxykncHB2z0oC54y4Yg1e15Cwzjnt513KMRlXUjqp2yPEeuCAMq4OnubjX7eHUF5ZrSGRMeDuqsRJ0+srBsjryg+lclrZ0rbaVPm8/oe5zcsZN7rrPAr2/Hti9++nCQidTjcYRnAyUVs7sPLbp40A0UAUAUBR6RxfY3c0lvBcI8sRIdNwfZOCVyBzgHbK5FAXlAFABoBB4W7ULa+vprHkMbK7rC5YMswQkHwHKSASBvkDrQHbth4dlv9PKwAmWGRZkUdW5QwIHrysSB4kY8axxAkcBa2uqa7HcoCBHYnnBHuvzYYeu8nWuDTbJ2lJ031b+Bsqz23k241IGsyqy7VXfVO5aNBYPM1vFcANvMuAG588pUscdOjA52NeVOLls539BjmarmvQPzhw5xLcSpNY6fEzXdzdzyGT6scb8oL58Dsdz0x4kiom50uNxdqtUeYpcO/Od/cbo1XGDijbOAeE00q0W3VudyS8sn25Gxkj0AAA9B55qWNJ74w40s9KQPcyHmbPJEg5pHx9kZ2HqSB60BaaNqcd3BFcRZ5JUV15hg4YZ3HgaAm0AUAUAUAUAUAUAUAUAE0B5RwRkEEeYoD1QBQHl3ABJIAG5J6AeZoD89dofEF3qTvfW2VsrCRDC2SO9lEigyqB1xkYJ6L5FiK553dKNWNFv2pcj0oNraP0FbTB0Vx0ZQw+BGRXQeTFuB+0m6/SDx3chktJ7mSKCXACxyBsoqkAeyQyDB8wfPONpZ2c7wbaxxvWQY7penxavc31/OvPBN/a1sD/iY8BpF8ssoIPUEGqvruqToVIU6T3r2n9kddtSUk2yVwFrUmk3A0i9cmJzmwnboQT+xJ8Dk7DwJx0Zam7C+heUlUhx5roznqU3CWGPh4TtDffpHkP0nk5ebmOMcvLnl6Z5ds+Vdp4PvGnEcem2kly+5UYjTxeVvcQfE9fIAnwoDKYuz5pLLvWbk1JpDc990KzMefuyR0GcfBt/SqlU9INm93b6a3fqdits0+80Ts74u/SEJSZe7u4DyXMR2IYbc4H2Wx8jkeptcJKUVKLymcjWNw3V6MCZ2n8SvZ2wht97u6PdW6jqC2zSegUHr5keGa8TqRhBzk8JGUsvCEd+zRIbeI2kpivYTzpcZxzv1Kv93wG2w65yc1Cj6ST9ZbqL2Hy6d/5O2VqtnC4jx2f8bfTg1vcJ3N9DtPCds4/wAJH5qdvPGR1BBNvhUjOKnB5T5nE1h4Y517MCZ2jcSPBGtnanN5dZSED/BqdnmbyCjOD5jxwa0160KNN1J8EeoxcnhCtqHAqLZwxWp7u4tcPbz7Bu9B5jzejEfLbyxVLtddqRu3Uqe5Ll0XL5HdO3WxhcR04A4sXUrcsw5LiJu7uYehSQbHbrynBx8COoNXmLTWVwI/GCZpHClraXM91DHyy3GO839nOcnlH1cnc+ZrIFXi7iCS/mfTLFyqrtfXS9IlPWGI+Mjbgn6u/jnlj9R1CFnS25ceS6/obKVN1HhHDXeEYJ7A2MaBFVf1P3JFzytnruScnqeY+dUi01SrTvPWJvOePh+h3zop09lF52YcRtf2QWba5gJhuVPvc6bcx/eAyfXmHhX0WMlJKS4MjGWfDHB9lpvP9EhEZkPtElmYgdFyxJCjyr0Cq4z42+jOLOzQXF849mMe5EP8ZOR7qjIONidumRWmtXp0YOdR4SMxi5PCFaw4FV+8nvpPpd5KjK0r+4nMpGIl6DGdjj4BelU669IKlWrFUvZimvF7+f4O6FslHfxGfsbuzLpFtze8geMjy5JHUD/NC1dkzgHWsgKAKAKAKAKAKAKAKAqOLrnurG6k+zbzN+EbUBkPAWh39laQXVjc+3InPLaT7wSBiSvKRvG3LjfxPiBtVfqa/TpXUqNReynjK88/E6VbuUFJGg8NdolvcyfRrlGs7sbGCfADH/sn6OD4dCfAHrU5TqwqxU4NNHO008MdK2GDNe0zWHupk0a1fDyjnvJB/grfbK/vNnp5EDo1cl7dxtaLqy5eb5HuEHOWEd9R0KP6BJZwqFTuGjjHXB5Tyk+Z5sEnxNfP6F7P12Neo9+1lklOmuzcUfeF+Iv/AHcFzn2obSRPXnhVo1z6kqv419LIoUNA4SFxoSQEASSKZ426cshJMZz4ZXlUnyJqmXOpOjqrnn2ViL8OfnvO6FLaok+948e80iGCNsX1y/0ORTsyMMCaRh1A5CDnwMnpVuq1o06TqS4JZOJRbeBv0yxS3ijhjGEjUKvwA6n1PU+pr5dc15V6sqkuLZMQjsxwQ+JtAh1CBoJh6o495HHRl/8ATxFb7C+qWlXbhw5rqeKtNTWCLwNxnJDL+jNUYLcIP1E7HCXCdFPMfr7fPHmDn6Pa3VO5pqrTe5+RFzg4vDK1bo63qH0k5+g2blbYfVmnHvTeoHh8vNhUNr2o9hS7GD9qXkv1N9vS2nljjVDJIT+LtKmgmXVbEf2zCP1sYzi4hHvKwHvEAfHYeKrVo0HVezl6vVfsvg+j/D+px3NHPtIdtK41s7iw/SHeBIVUmTm96Nh1RgOrZIAA97IxnIq6nAJfDdtLfXLatdLylxy2cLdYYN/aP33BJ+DHwbAp3pBqm1/tqT3fxP7fk7raj/ExuqpnaLXF3DBuilxbP3F7DvDMNs4+o/mpyRvnGT1BIM3pGrytJbE98H5d6OevQU1lcT7p/a1FHaTG+Tub23HLJbdDK/RTFnqpOCevKN9xgm/05xqRUovKfMjWsPDOPBmkzEvqF6ea7uMEjGBDF1WJQfd8Mj4DqCTR9e1Pt59jTfsx83+ESFvS2VtPiNVV3J1CPxVHLpl0usWqkrsl9CvSSLpz/Ebb+BCnpzVcfR7Usr1ao/D8fg4Lmlj2kXHE/HJvO7stJkDSzoHkuB7ttCwB5jjpIQfd6jPmRViu7qna0nUqcPqzlhBzeETuH9EisYVghGw3Zj7zserufEn/ANB0FfOL29qXdV1J/BdEStOmoLCLKuNGwSNUuTo+px6gNrW6xDeDwV/qS/ln+a/i1Xr0dvu1pdhJ748PD9COuaey9pF1xHxzLdStYaSQ8g2nvOsEAOx5T0eTy8Pjg8sveXtK0p7dR/Dm/A0Qg5vCOvDfDsNihCZeRzzTTPvJK/Us5O/Unb188k/PtQ1GreTzLcuS5Ik6VJQRcZqPNpR9jk/KNQtSd4b6UgeSSe7+aNX1W0mp0ISXNL6ENNYk0aNXQeQoAoAoAoAoAoDK9b7W2SeUWlmbm2tiBdThsePKe7HiBvv44J2HtVrnVpwkoyaTfDvMpNrJpWl38dzDHPE3NHIiuh6ZVhkZHgfTwrYYFbtfuzHpNyF3eQJEo8zI6qQP5pasNpLLB90+1EMUcS9I0VB8FUL/AFV8puarq1ZT6tsmYLEUiHxDw9bX8fd3EYYfVYbOh80bqPh0PiDW+yv61pLapv4cn8DzUpRmt4sxa5qWgqyyhr+yCt3chJ76E4PKJPNM7Z6AdCNlN50/V6N4scJdHz8COqUJQ8Cx4D0WWGN7m63u7pu8mJ6qDusY8gAengTjwFVbXdQ9ZrbEH7MfN83+Dst6WzHL4saagkdJjWu6o9pDfaKmee4vkaHqAIZuV8D5rGuPHmavp1jcqpaRqv8A67/hxIipDE8GwWluIkSNfdRVVfgoAH8K+bVqjqVJTfNtkrFYWBPg4GEer/pBCojKuxTxEzLyHA8iGZs+dTc9Z29O9Xl725fD/Nxzqhiptch1qvt5OoKwCl4r4Zg1KHuphgjeOQY5kbzHmD4jx/AiR0/UatlU2ob0+K5M1VKSmt5YaVp0dtCkES8qIoVR/EnzJOST5mua5uJ3FR1Jvez1CCisIlVznsKyngwxCn7Ogb0yCTFk7iaW1y3K0y55Ry+6UySd/MjGDtaIekMlZ9n/APpwT7uvicjtszzyH2qu228s7EgrACgKnUuG7W4miuJYlaWI+w3n4gMPrAHcZ6H51IUNRuKFKVKEvZf+bunQ1SpRlLaZbVHm0KA8yRhgVYAgggg7gg7EEeIr3Cbg1KLw0YazuKjhnhi205XW3UjncsxY5bGTyrn7Kg4A+J6k13X2pVrxrtOXL7/E106Sp8C5qONoUBB1vSo7yCS3lGUdcHGMg9Qy56EEAj4V1Wl1O2qqrDiv8+R4qQU1hn3R9KhtIlhgjCIPAdSfNj1YnzNLq7q3M3Oo8v6CEFBYRNrlPYVkCpwHJ3OvajAdhNDFMvryhQfzkb8K+k6LU27Gm+ix8mRVdYqM1WpQ0nC5vI4hmSREHmzBf4mgOdnqcExxFNFIR1COrH/VNAS6AKAKA5zxc6spJHMCMjYjIxsfA0Bjzdmupaakq6dcRXMEnNzW1wgUtzLykZBwTjbqoNclzY0biUZzW9cGtzR7jUlHgNfY3YXlrp/0e8iaJo5XEYYqSYzhvqk/WL11ngi9pUvf3mm2Q3/XNdSAeCwKeTPoWJHyqP1Sv2NpOXdj57jZSjtTSLqvmRLhWAFelJrejGArBkKwCpn4ct3u1vXTmlWMIucFRgkhgMe/vjPgKkIajWhbO3i8JvP6eBqdJOe2W1cBtCsAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKAi6rfLbwyzsCVjjZyBjJCgnAz47V0W1F1qsaS5vB5nLZWRf0/tB0+UDmlMJIB5Z1aP/AFj7B+RqRraFd029lbS7nny4njtUlmSa8UMdnexTLzRSJIv2o2Vh+Kmoyrb1aTxUi14o9qcXwZ3rUehW13hieW7S8tbw2sqxGJmEYkLLzFujHA6/kKsGma4rOi6bjtb88cHLWt9uWchLwvcy4+kavfP5iJ1gU/EIDmuifpRVfuQS8cv8HlWa5sr9T4L0m0je5uY2cIMs0ssjMx8B7wBYnAA9a1UNW1C7qKlTaTfRL9TMqNKCyyX2IcOEGfU3hWAXA5beJQQEgyDnfqGKrv48ufrVd6cXGKi3l9epwPiaxXswFAFAFAeXcKMkgDzJxQFXe8TWUP7W7t09GljB/AnNAZ3w5djUdSvdRG8S8trbN4FE9p2HoWwQfvVVPSe5xGFBeL+x2WkN7kOFU07wrACsgKA+4pgZPlAFYAUAUAUAUAUAUAUAUAUAUAUAUAVnACgCmAGKYGQxWcAK8go+OTjTrv8AkJP6JqR0n99pf3I1V/8AjZn0aDkVSMjlAwfhVinUltt95d6VKLpRi1ncjhY6WgvLQwr3btcLzNGSuUUNI4PLsQQmK3SuZu3q7e9KL49eCK/rFnQpRjOEcScuXxNkqjkaFYB5kcKCzEAAEknYADcknwFe4Qc2orizDeN7EfSLBuI7sSupGmWz+wpyPpMo2zj7A/gcdWOPomkaYrOnmXvvj3dxF1qu2+42JFAAAAAGwA6AeQqXNJ6oAoDMO2zWdRs0hltZGjtslbho1UupJHLksDygjIBGN+vUU8AQNJ4ejvYluDqeoXCOMjNwyr6gqo9kg7EelU6+129oVXSlBRa8WdtO3hJZydz2b6Yx5ngeQ+bzTk/06jpekF8/4kvgjcraBNg4I01OllD/ADl5/wCmTXPLWL2X/wCj+h6VvTXIubOzjhUJFGkaDOFRQqjO52G1cFWtUqy2qkm33m2MVFYR3rWZEfiLjsrI1vYos0inEkrEiCNvLbeRvQdPXerDaaLHZVW6eynwiuL/AAKNOrcy2aKz1fJCzPcX0281/P8AuwYhUeg5Bk1Jx9VpbqVKPx3kvT0FNZq1G33biNJYytsb285T1Xv3IP41sVzBb+zh8j29AoZ9+XzPC6QE3jmuI2+0k0gb+NevXG/ejFrwRsloNs1uyu/Jc6bxde2Z/tjN5B4sAFuEHnttIPjv61x1tNtLr/j/ANOf/wAv8EVc6bcWq2l7cfNGjaXqUV1Es0Dh42GzD8wR1BHiDVZubapbzdOosNHHCaksol1znsXeKuMIdPKIySSyvkiKIAuFHVj5Dw9cHyNSthpNS7i5pqMVzfU1SqPOzFNvojpw5xda35KRM6yheZopEZXUZAyfqncjoT1rze6VXtY7c8OOcZT4mY1E3svc+8vqizYQda1aKzhaeYkIpAJALHLHA2HqRXVa2s7moqdPieJzUVlilP2nwKf71uu7yOaRkCqBn3sZJIqZj6O1Hu7SOen2PMpVIracHjrgegc9PlVfccPDNie7JnsvaDdc7iOxR0WR0B78Kx5GK53XbOKsv7DtlFbdVptJ8Op6oW91Xjt04ZW/njgff7IV1/kz/wA1H/8Ajrz+xLX+f/8AP6m71C+/l+aPLce3p92xiX9645v6KCsrR7Ncarf/AInpadfP+BL4oivxdqjHYWkY/dlc/mwFblpunL/u/kjZHSLyXFxXzG/gfV5Lu1DzFTKskkchUYXmRjjA8PZK1Darawt6+KfutJr4kfFSi3GXFNoWuPNTujeLbQXLwItusjGPGWZnYdeoGFqV0qhQja9tUgpNya39Eb7W0d3WcNrCSyUKrd+Oo3nyk/5V3OpQ/kw+RKL0fhzqS8j40M7e9fXp/wDrsP4YrCrU17tKHyNi0ChzlJ/E5PpnN709y3xnkP8AXWxXbXCEfkev2Dbf1fMuez237rUGQSSFTas3K7swJ71Bnc+A/jXHq9TtLHaaWdpcF3Mhr2zp21woU84xnjk0+qiaii46H9zrv+Qk/o1I6T++Uv7jVX9xiEnQfCp6fvMvdP3F4ImcMR8+owD/ABcc0n5LEP8AaGvF5LYsaj6tL7/Yr2tzzUpw8X9jTqqZFBWQJOud5q93+irdykMeGv5l8F8IVP2j/H0VhV00DS+zj6xVW98F07/wR9zWy9lGhalqdjo1oveMsEMahI0G5OBsqL1ZvH8SfE1aTkMu4v1zU9TtJbqNmsbSNDJEmSLifl3DOVI5FxuAP9bYiMqarRjcxt475N47kbVRk4uTK7+zZN9mpPDNOTcdI1q2u1ZraeOYKcMY2DAHrg4oZJVzbpIjI6hkYEMrAFWB2IIPUUBjGsaNLw1cG4gDSaZMw72PctbsTgEZ6jwDePutvykxeqabC9p44SXB/b/OBtpVXTY+Wd0kyLJGwZHAZWHQg186rUZ0puE1holIyUllHatR6CsgTO0HW3QLZQMVlmUmSResUIOCR5Mxyo8sE+VT+j2kd9zVWUuC6v8AQzSoSuaqox+L6IVLW2SJAiKFUdB/11PrUlVqSqS2pcS429CFCChBYSOF1qUcbBPaaQ+7HGC7nx2UVspW05ra4Lq9yOW61K3tvZk8vouJ2CXhHMNOuseqqG/zc5ps26eHWj8yP/b8eVOXkcbfUUZu7YPHJjJilUo/4Hr8qzUtpxjtJ5j1W9HdaapQuHsxeJdGTK5iS3HPSNSOm3AmBxbysFuU+qpY4WYeRBO/mK31qKvqDpy9+O+L+xVtWslQl29NbnxXTvNcZgNycAbk+lU5Qbezzzgj29xjFjO11NNev1nb9WD1WJSQi+mwH4Vdq6jRpwt4fwrf4k1ods1B3EuMuHch07MtOURS3hHt3EjAHyiiYxoB8SrH1yPKoXXLh7ULdcIrze8hak+1rzq9W/ktw6VXzIsdpsXNplz6KrD4rIjf1VMaFLF9DvyvmjTce4xE1GLvIZF+0jD5kbfnU9RnsVk+8udzDtbaUesfsaZwhcmWxtZCckwRZPqEAP5g1WdShsXdSP8AUym0t9NeBnNzomoWrSA2hmjMkjrJC6s2HdmwUOGzv5VZY3VncxTVTZeEsPuO6x1Opa0+ylDK3709+842V33vN7DoyNyski8rqcA7g+hFK9B0sb089CxWN9C7i5RTWNx51DUooADI2M9Bgkn4AUoW9Sr7qPV3fUbZJ1Xx5c2fLWS7n/vewuH8mcCJD/Ofatk6VvS/5asV4b2RE9fT/wCKm347h/4A0ae0glFwEDyzvLyo3MFDJGuCfPKnpVe1e6o16sexbaUcb/F/kh1KU5SnJYbeRZ45s7pb5p47SWaNoY05o8EgqWJ2G/jUrplShOzVOVRRabe822l47StKbi2msFCdRlHvWN6vxgau71WD4VIfMlV6QUucJHF+IoUOJBJET4SRsv8AVWVYVGsxafxN0ddtJPDyvFFvXC9zJpPKyTeEmxqcf3reZfwaJv6q8X2/T590kVnWv3im+5/U0yqoRpTcaLnT7v8A7tN+SMakNL/fKX9yNVb3H4GeQnKqfQfwqwVFib8S80HmnF9yLfgCLm1Cd/sW0aD055GY/wBAfhXPqssWMI9ZN/JfqVfVXm98Ir7mi1VzjF3jziMafaNIN5W9iFeuXPjjxCjf5AeNSukWDu7hJ+6t78P1NNepsRGLs34YGnWSRtvPJ+suHJyzStuQSevL7vyJ8a+kJJLCIoXu1Ls9utUnhuLe4iUwphYpVPLzc5YtkBgc+yOUrj2fWjSawwK3FFjxHHbSQTW8V0kqFGktwTIOm/KvL1GeifhUVT0W1p1lWgmmnnjuNzrzcdllf/YUuPtfwqV3mjB34J0O4X6VeWM/dTrdzoEfeCWNSCI5F8NycMOmfmIW+1hWlzGnNey1x5re/mdFOjtwbXE0XhrtHhnlFreRtZ3eQO6l9xyTgd0/RsnoPHwzUvSqwqwU4PKZpaaeGOd1bJKjRyKHR1KsrDKspGCCPEYrYYMcWBuHr4Wrsx0+6Ym3dt+5lJ3jJ8txnPgQfBqgdb0xXNPtYL24+a6fg6KFbYeHwH6qA1gkwrMVl4Rh8DH47v6VLNdnfvpDyekUfsRgfIc386rnUh2NOFBfwrze9k9olBKk6z4yfktx8KSzzJaW5AlkBLOdxFGPekI8fIDxNZh2dKm69X3Vy6voetVv3RSpUvefkuppfD3DtvYpyQr7R9+Vt5JD4l26nfw6VWb3UKt1PMnu5LkiuQppb+fUtq4DYVnEGgwX0RjmXPijjaSNvBkbwIPyPjmu6yvqtrNSg93NcmjXOCkZnFHJE8kExzLC3KzDYOCAUkA8OZSD8c1ZauxOMatP3ZLPh1XwLRpV5KvSxP3o7n+TzqFv3kTofrKR+W350t57FRS7zrvKKq0JwfNMbb3WD+gTcE+01ooz991EWf8AOaoynbL9r9muCk39yjOT7HIp20XdRqo+qgH4CpSctuq31ZeKMOxt1Fcl9jROB0C6faAf4iM/NlDH8zVb1aWb2p4lMo+4i8qONoudozhdMus/4vH4soH8aldEi3fU/E03H/GxIQbAegqcb9rJeor2Eu4cezJj+jolP1GlT5LM4H5YqG11YvJPqk/Io9JYTXRv6jTUQbDLeII+TUrsfaEDj5x8h/OP86t1u9qxpPpleZLaFLE6sfBn3hpf7p238lcY+PKlZuW1YVcdYnjXP+al4P7Go1UGRmAoAoAoYZmXHWs/TpvocRzBCwNw3UPKPdiHovU+vw3t2mWzs6PbT96XBdF1N1jau7rY/gjx730ITMBudvEmiTb3FyclGOXwRZdnlhJPcm+I5YFjaODPWQsw5nHku2PX5GtesVoUbf1bjNtN9xTLu69buNuPux3LvNIqqGsreJYuezuV+1bzD8Y2Fdmny2bmm/6l9TXVWYPwMv0x+aGI+caH8VFWe4WKsl3sudlLat6b/pX0Gjs5i/XXj+fcL+CyH/eqO1mX+hSj/c/oVvUf3yb7kPVV05Cj4p4Wg1FUE3OrRkmOSNuV0JxnHgfdXqPDbFSWn6nVsm9jenxTNVWiqnEg2kOuWW0N7FexjpHdqVkx5CRSSx8MsflVnoek1Ce6pFx80ccrSS4Mnw9qHcYGpWFxaecqgTweW7p0+ABqct72hcf8c0/r8jRKEo8UOeia9a3qc9tPHMo68jAlc9Aw6qfQgV0ngssUBh2n8G8QZlt4nitIDPK/elkMjB26jk5mG2MD2a4qun29Wr2tSOX5fI2RqyisJjVw92QWkEiXFzNPdXCsrh3YqodTzAgA8x3H1mPSuyMVFYisGtvJo9ZBmvbffQNaLYmMzXU7r9GjTHOrA/tT9kY5l9ckdMkeJzjCLnJ4SMpZeCz0W3kit4Y5n55FjRXbzYKATnx38fGvl15UhUrzlTWItvBL001FJnDim5MVncyDqsEpHxCNj8696dBTuqcXwckKrxBszHTYuSGNfJFH5CrPcS2qsn3lxsoKnbwiuSQ29mNkO7muzu88rKD5RQkooHluGO3mPKozXazUoW64RWfi95Uak3VrTqPm8fBbh1qvg4Xl7FCvPLIka9OZ2VRnyyxrdSt6lV4pxbfceXJLid61NNGeJmfGIxqbY8bWIt8RJKB+VWmwy9PWeUn8sIk9Ff8AuJruX1IEr4BJ8AT+ArdTWZJd5Y6stmnJvkmWGpJy8P2yH6wtR8mlV61UXnWKkly2voUGnHMIJ82vqQSK2J4eS/yWU0OvZ3c95p8C/WiBhceTREp+YAPzqF1qk4Xcpcpe0viUWmnFOD4rd8hkqKNgk9qV2O4itRgtPMmR5RRESO34hR86sGg0v9Sdd8Irze4xCHa1oU1za+QuV3cS8JYHDs1H9og+c1wR/wCM4/qqJ11/7r/xj9CjL3pf3P6jTUMejNOMBjU39bWI/hJKKtVg82Ef7n9iS0V/7ia/pX1I2hNy6lZnz+kL+MRb/drbcb7Gsv7X5mzXV7dJ+JqlVEiQrACsgSOO+KGQmytG/thh+tkHSCM+P8oR0Hh18qsGladHHrNdeyuC/wCz/BinTnc1Oxp/F9EK1jaLCgjQYA/EnxJ9TUlWqyqycpFxtraFvTVOHBeZ7sdMOoz/AEVSREmGunB3C/ViB+0+PkAfhXqdaNnR7eXvPdFd/X4EHrF5tv1am/7vwa1BCsahEUKqgBVAwAAMAAeAxVOqVJVJOUt7ZFKKSwj3WsycL5OaN180YfipFb7d4qxfevqeZ+6zH9CbNtD/ACa/kMVb7xYry8S2aY82lPwQ69nG4uz/ANsg/CGM/wC9UNrW5Ul3P6lev5bV3PuwvIcqgjmCgCsoC7xbxbb2C8r/AKyZxiO3Td3zsMj6qk+J6+APSpbTdLr3U1KPsx/7fjvNFWtGCIvZRwbcxXMup3UaWzTIVS1jULyqxVsuB7vuj2euSScHavodKn2cFDLeOb4kZJ5eTVq2GAoAoBd414qj02EMVMk0h5LeBfflkPQDyUZGT4epIB8ykorMnhIJCjwvoEiSPe3rCS9m94/VhTwij8gOhI/5mh6zq7updnT9xef+ciRoUNne+IzVAZOoqOL4DJY3SDcmCXA9eQmu3TJKN3Tb/wCyNdb3GZtYSBo0YdCin8QKstaOzVa6MulrNToQkui+g4dlcoNh3fjFNMjDyPOX/g4qK1+GLpS5Sin8lgpdNOLlB8U39SXx/rFzZ23eW6rkuFeR9xCrbd5y/W328hkbGtOj2tC4rbNZ8spde481ZSWEt2efQzptLEpMly7XMh6vKSRv4IOijyAqxu6cPYpJQS5L7lkttFt4xzU9pvny+Ax8O8cw2UDW947c8OBDhSzzRH9njG3MPcOcDYb9aj7zSJ3VVVaCWJce58/mV6vD1WrKjLlw70+H4KSO5kuZpbuVeRpSAkZ6pEgwin13JPqflXXUjTo040Kbyo8+rfEn9GtZ04yq1Fhy5dEctURpQttH+1uGEaDyB99j6BckmvdslDNaXux3/g26zcqnQ7Ne9Ld+WO3aPbLFpZCD2YWt8D7qSIv8KhNHqurftv8AiUvMrDxBRfRr6ivUi0X1NNZQaVq02nytJFGZoZcGaEHDhgMCSPOxONiPHA+WytQpXtJU6jxJcH9mVzU9OqRqOvRWc8Vz8UXs/aZGVxDZ3byEbLIixqD95uY4/CuCPo+081KsVHu3v5ETCNefswpyz4YFod9NM11csGmYcoVfcjQbhEz69T4n8TJTlTp01Ror2V5ssOl6a6DdWr778kdZ5gis56KCT8AM1qpxc5KK5krXqKlTlN8EjQOB7Mw2FujDDGMOw+9ITIc/N6gNWqqpdza4Zx8t32KPS93L57y8qNNhmvGg/un/APZx/wC1lq06d+4L+9/REjo37zP+1fUrrSTkvbFv/mOX/wARHX+uupR2retH+n6HRr26NOX9X2NbO3WqhsS6EJtLqANYlFrijKeRV474ke0VIYADcT8wQn3Y1XHNI3njOw8/hgzGk6fCu5VavuR830MKM6s1Sp8X/mRHsLMRA7lmYlndt2djuWY1NV67qPolwXRFtsrKnbU9mPHm+rIXEGqdwqorKryHCs2eVBnBdsA7DPkfnW+xtu1ltPgvM5dX1D1aCjD3peXeOPDXEelWECwx3DSH3pJBFOzSSH3mbCfIegFRN/YX93Vc5RSXJZW5fMq1NpLm34Mnydo9kPC4PqIJP6wK5VoF0+cf/Y2Ocv8ArL5MZNJ1GO6hSeIko4ypIwcdNx4dKi7m3nb1HTnxR6hNSWUSmGRitdN4kmZZlOncGapFGsQW1AUYDPI5yM+SrVtranp85ubct/cdNtqVzQpKlGKwhy4F0KazilFw0bSSzFz3XMUA5VUAcwB+rULq15SuZx7LOIrG/jxOXanOcqk+LeRlqIPR8ZgBknAHUnoB616jFyeEjDeOIkahxbPeymz0dBNL/hLo/sIQduYHox677jbYNVs0z0ebxUuf/X8/g4q1zyiNvBPZ1b2DfSJWNzeNu9xLuQSMHuwfd8s9T542q3RjGK2YrCOLOR1r0AoAoBd404vg0uIPLl5HPLDCm8kr7bKPAbjJ8MjqSAcPC3sCnw/pE0kp1C/Ia7cYRBultGekcf3sH2m9SPMmi61q7rydGk/YXHv/AEJC3obPtSGSq6dYVgHxgDsdx4ivUW4vKMPeY/FaG1lls2zmFj3ZOfahY80bDz2PKfVaulSSrwjcR/iW/wAeZO6JcbVLsJcY/TkSdO1GexkaW3VZFfHfQMeXmIGA8bfUfGxzsQB41rqUqN1TVOtua4S6ePca9R0ycputQ4vjHr4FvddpUDo0b6fdsWBVozGhRgRggnm3B+FctLQakJqca0Vh5zzIKUar9l0pfJitoaSrHiReQcx7tS3Myx/VVjjcgbZqRvJU3P2Hnr0yWnSYXEKGzW+HXHeTygJzgZHQ43HwNcynJLCZIunByUmlkgXGqjnEMCNPMdhHHuc/eI90eflXVTtXs7dV7MerIu91elQzCHtS6L7j1wPwm9sTdXTB7lxgBfchT7CeZPifkPEmD1XU41V2FDdBeb/BXJTqVpurVeX9Bi1zThdW8tuTgSRsufIkbH5HB+VRdncer14VejMVI7UWjJNHnblMMo5Z4TySoeuRsD6gjxq33dJKXaQ3xlvRZdIvFWoqEn7Udz/JYVxkuFZAUB4trA3s6Wi+7kPcHwWFTnlJ8Gc4UemTW51Va0nXlx4R73+hX9auk16vB73x8B44216WxiiMCRs8kgjXvOYIvss2SF3Pu4xUHpdnTu5zdVtJLO7i95B7M5SjThjLeN4pjinVW6taJ+5HIx/1mqV9Q06PKT+JJR0a6fvTivmyuAnkmae4n75ygQewqBVBLAAL6k10ynSVJUqUNlJ545ySen6a7WbnKeW1jgF9YpMoVwcBgwwSCCM4OR8a8Ua8qTbidt1aUrmKjU4cSL+g4PrIW/fd2/i1b3e1uuPgjkjo1mv4PNsaezLlhnurdBhCsUqqOgJ5kbHx5VqM1vNShTqy45a+5AXtCFC6lCG5YTPPaLHy3to56NFMg8sqVf8AgT+FZ0iW1Z1Irk0/sbNNko3sc800VVbS4HkoCckAkdNq9KUksJniVOMnlpHrNY3npJIKzF4eTEllNDr2cNnTbcD6quh+KSOp/MVDa2mr2ffh/NIodFYjjplDJUUbDMuJdcubm5nhjnkt4oH7vEJCyOwAJZmxkDfAA64q3WdpQt6EJygpSks5e9LuOmxsfXHJyk0lyXEvuzzU5pRPFNIZe5dOWVscxDqTyMR1ZcdevtCo/WrelDYqU47O0nu8OfxOepS7GtKltZSG+oACx2kaTJd2EqRFudQJAqkjn5NyhA97IzgHxAqY0O5jQu058Hu8M8zRcRcobhh7KZbN9NheziWNSP1ijdhMNn5yd2OehPgR4V9GIscKAKAKAKAzrtG7PJ7+4jvbS67meJAqq+eTYkgqRkofaOdjnb5+ZwjOLjJZTCeBfTTeKYduW1uPvExj/gqHqaBZTeVFrwZvVxUXM+9/xOvXTbZvg6//ALFaJejVo+Dl81+D161Mj33GGrWal7vR2CDdnjYlVHiSQHAHxNaJ+i9F+7N/X8HpXcug86ZercQxzJnlkRXXPUBgDg+u9VG5ouhVlTfJ4O6EtqKZR8ZcMm8VZYWCXMQPdsfddT1jk+6fA+B386kNM1BW7dOoswfHufVGYynSmqtPdJefczPF1II5inUwTL70cu3zUnZh5EVYZWkmtul7UeqLHaaxQrLE3sy6P8kmS7jUZMiAeZYAfxrSqNRvCizuldUIrMpr5ojJeSzBmtLaS4RMl3UYQAdQhPvt90Vv9XhDCrzUW+CIi416EXijHa6slWtwsqK6HKsMg/8AXjXPVpSpycWTNCvCvTU4b0y04DuktLp4CoCXR5o3xuJgMtGT9lgOYeoPnWrU4SubZTi98OK6rr8Cq6jaq2r7S92fkzSqqZzhQC1xXwdFfESqzQXCjCzIBkj7Mi/XX8/XwqXsNWnbLs5Lah06eBr2ZRlt03iXUS7rQtVtzhrZLlftwOFOPVG3z8BipuF1p9ffGey+jJKlrVxT3VYKXetxDEl4Ty/o27z/ACZ5f87GK3dlQ49tD5nR+34/y2WFjw1qdycNGlnH4u7CSXH3FXYH97Fc9S+sLdZztvotyOWtq91WWILZXXizQeHtChsYu7iBOTl3Y5kkb7TnxP5Cq5e31S7ntT4clySOCMMb3vfUqu0PTJZ7ZGhQySQzxyBFxlhujAZ9HJ+Vdei14U60ozeFKLWTO26c41Es4eRIZbwddOuvkgP8DU7sW74Vo/Mml6QQ505eR8C3h6addfNQP4mihb860fmYfpBHlTke/oWpt7mmyfz5Yl/iaw5WMferL5ZNctfqfw0vM7x8O6u/S3t4v5SXm/oE1rleabDjNvwRplrV3L3YRXmMvBPDF1azST3UkLM8axhYefAAYtk8wHnUZqeoW1elGlRT3PO/wOCdStWq9rVxnGNxY8acOPfxxrHKIZI5OdXK8+3KylcZHXI/CubTL+FpKW3HaTWMfEw1NSUoPDXMWB2e33+UU/0df+KpT9t2f8l/M6FfXv8AM8kB7Pb3/KS/6Ov/ABU/bdn/ACX8w72+/meSPn9jq9/ymP8AR1/4qz+3LT+S/mefW77+b5I9J2dXg66n/wCXT/jry9dtuVD/AOv0Hrd9/N8hz4Y0f6FbR2/OZOTmJcjl5i7s5OMnG7VC6hd+tVnVxjON3gjTTi4rDLSuI9i1rvA9peSmdxJHIcBnhcoXA2HNsQdts9dql7XWri3p9msOPeuBqdLflNrwLbRdHhs4xFAnIuST1JZj1Zid2JwNz5Dyriu7yrdT26jy/JHqMFFE+uQ9hWU8AUODm/ResSWY2tr5TLAPqpMgJdR4DYN8uQV9H0e99atk37y3P/O8iq9PYmazUsaQoAoAoAoAoAoCj45QNpt6D/8ACT/7JqAT+zzP6NtM/wCKH4ZOPyxXzbWf32p4/Ylbf/jQxVFm4h6npUF0vLPDHKB051DY/dJ6fKuihd1qDzSk0eJQjLiing4D0xDzCziJ+9zOPwdiPyrsnrd7JY7R+R4VvTXIYo0CgKoAAGAAAAB6AdKjpVJTlmTyzaopGZ8a6S9lObiGF5IJiS8cS8xjn+0AOiv/AEh6irVpteN3R7OpJKceb5x/Q32d9Kyk003B8lyZ40LhS9vGjmnxaRpIkiIRzTlkPMpOcCPf59dq93Oo2tqnCn7cmsPpv+p5u76vebmlGPmajVPZrCsAKAKzkBQBTICsAKyApkBQBQBTICgCsAKAKAKAKyAoArACgK3Xddt7FBJcyd2pblB5WbLEE4wgJ6A12WljWu5ONJZa3mudSMFllND2j6W5wLsD95JlH4lMV2y0G+ivc80eFc0+paWvFFjLsl5bk+XeID+BOa5Z6Zdw96nL5HpVoPmL3aTcpGtneo6lre7ibmBB9hj7Y28Dyr+FTfo32lOvKnJNZXfxRz3WHFNGxVdDhCgCgCgCgCgCgFrtKuBHpV6x8beRfm68g/NqApuFrYxWdtGeqwRA/HkGfzzXy/Uam3dVJf1Ml6SxBItK4TYFZwArACgCs5AUyArACsgKwAoAoAJrKTbwg2eYpFcBlIYHoVIIPwIr1OEoPElhmE0+B6rwZCgCsg+BgcgHcHB9DjOD5bV7cJJJtGFJM+1rMhQBWQUHFvFtvpyAyZeRv2cKe+56fzVz4n5ZO1Sen6VVvJezujzfL9WaatZUzjwbxjDqSsADFOn7SFuo3xlTtzDO3mD1G4zs1PSKllLPGD4P89DFGuqniMtRBvKHjLiVNOg5yOeVzywxDJLufhvgZ3+Q6kVJ6Zp0ryrsr3Vxf+dTTWq7CE/6Rr2lRrdXifSbd/bmQEGSDmOcEgZTr95R02q4XehWteGILZfJr7nDC4nFj5oGuQX0ImgfmU7EHZlbxVh4H/8AoyKo95ZVbSpsVF8eT8CQp1FNZRZVyGwSJ7FdW1qO2dQ9tYx95OrDKvK+OVCOh+p57K4q++jtr2Vs6j4y+i4EbczzPHQ0CTgbS2GDp9r8oYwfxAqwHMVF52S6PIc/ROU/ckmUfgGwPwoCGnYvpAOTFKfQyvj8sGgNEoAoAoAoAoAoAoDPu2qbms4bQdbu6hh/m83OT+Kr+Na61Ts6cp9E38jMVl4LYADYdPCvlLzJ56kwtyE/Xu0GCF+4tUa8uScCKDLAHxywBzjyUHpvip2y9H69fEqnsx8/kc9S5jHct5CTg7XdUHNd3S2MZ3WGPJb05gjDI/eckeVWy10q1t17Mcvq97OOdacuLJfA+sXKyy6bqH99Qbq/XvYtsMD9bGRv1IO+4NVrX9LjQfb0liL4ro/1Oq2quXssc6rB2BQHO4nWNS7sqKoyzMQFAHiSdgK2UqUqklGCy3yPMpJLLEe44tutRka20aEyEbPdyDEMfqvMNz8dzjZTVs070cSxO5/9fy/wcVW65RIV1Pq2gOGvWN5ZMwzMuS0bMd9zuu591vZOwBBqSv8AQ7e4h/ppRl5fFfc107iUXv3o0GwvY541licOjjKsOhH9R8MeGKoVehOjN05rDRIxkpLKJFaT0crq5SJGkkYIijLMxwAB4mttKlOrNQgstmJSSWWIZju+JGMdsWttOViJJ2BDz46hF8R6dPPf2avmk6NG1XaVN8/JfqRtau57lwPF/wAI3vDrNc2LNdWfWe3f9ooAGX22OMe+oBHiCBmu7UNOpXsMT3Pk+a/Q106rg9w56BrcN9Cs8DcynYj6yt4qw8CP+Y2NfO7yzq2tR06i/DJSnUU1lFjXKexQ4y4jmWRLCwXvL2YbYxiFPttnYHG4zsBufAGx6JpHrD7aqvYXBdf0OS4r7PsriVj9lGoWKC6sb0yXe7TxtskxJJIBY+11x7fU75XpVyr21GtDs5xTX08OhwxnKLyi54M4xW+5oZUMF3HkSwNkHbqyZ3x5g7j161RdV0edo9uO+D59PEkaNdT3PiNNQh0C3xlxR9CVYoU767mPLBCMkkk45mA35QfxO3mRNaTpUryeZboLi+vcjnrVthY5kzgLs8+jv9Ov2+kXz+0WbdYc/VQdOYdOboMYXA63+lShSioQWEuCI1tt5ZF7SOBHZ/0np3sXsXtsqjaYAb7fbxkfeGx3xStShVg6c1lMKTi8o4aBxza3Nm12zCPul/XoTujeAH2gx2Xz6dciqBdaLWpXKowWVLg+79OZJQuIuGWR+zXR5NTuTrN4pCglbGE+6qjI7z1PUAnqcnwWrvZWdO0pKnD4vqyPqTc3lmssoIwQCD1B6EV2HgxrjDhSbQ5zqemqTbH++7Ue6q5yWUeCDr9w/dJA472yp3dJ05/B9Ge6dRweUMlrxNby2bXsbZiVGdvtKVGSjDwbwx6jHWvn89Nq07pW81vbSXR5JJVYuDkj12L6YyWTXko/XXsrTufHlJIQfDqw/fr6TTgqcVCPBLBFt5eTQa9mAoAoAoAoAoAoAoAoAoDHO1XiOGDVrPvywjtoJJsKMl5JMoqgdM+wDk4HWuLUKM61vKlDjLd4LO8905KMssjaTY6jxES0hay049Av7WceQJ94euOXfo2DXNYaPQtPa96XV/Zcj3Uryn4GqcN8MWmnR93awrGPrN1dv32O7f8AWKljSXFAZf2w2v0WWz1ZBvBKI5yB1gkyN/gSwHrJXNeW6uKEqT5rz5HuEtmSYyqwIyNweh9K+WyjsvDJdPKyUnFfFVvp0fPMcu37OJffc+nkPNjt8TtUhp+mVryeI7lzfI1VaygL2l8GahrbrPqjNbWoPNHaISHYdRz/AGfi3tdcBavtjp1Czjimt/XmR1SrKb3muaVpkNrEsMEaxRr0RBgep9SfEnc13Gs7XVukqNHIqujAqysAVZTsQQeooDGpYv8A2cvhAzH9HXRJhZiT9Hk2ypJ+ruNz4EHqrZg9a0tXVPtIL215rp+DooVdh4fAeru6SFGlkYKijLMegA8aolKjOpUVOC3vcSLkksiFpNhPxNP3kgeLS4n2X3WuHXzI8PM+HQb5I+g6XpULOGXvm+L+yIyrWc33G0WlskSLHGqoiAKqqAFUDYAAdBUsaTqaAyXjThuXSJm1TTkzCd721GylepkQfVxuTj3evTIriv7GneUtifHk+jNlOo4PKDVe0C1SyF1A3evJ7EMP1zLt7LqNxjIJ+Ix1FU230KtK67GosRW9vqu7xO6dwlDKGTsz4Qaxia4uTz3tx7dw7YJXO4jXGwA8cdT6AYvkIRhFRisJEc228sdq9mBG7ROAxfctzbN3N9FgxSjbn5eiSf1Hw+G1eZwjOLjJZTMptPKEqLtPSG2k+lxlL2E929vgjnk3GR9ldiT5eGcjNPrejcvWUoP/AE3z6d34O2N0tjfxGvsy4SkQnU772r24GQCMdxGRsig+62MZ8ht55ttChChTVOmsJHFKTk8s0OtpgKAyriPsZhur76RHMYoZG5riAD3jnJ7sg7BiMkHoSSPAADULW3SJFjjUKiKFRVGAqqMAAeAAFAY/fdqV5DfzyiISaZDOLeR1X2kIwrOCDk+1k7jBBA2JBrW60FUVNv2nvwZ2XjJr1vOk0aujK8bqCrDBVlYZBHmCDWwwYzxh2S3ayyfotwttckCeAsFCe0GyAdmQEZwPaG4GQa8SpwlJSkt64PoZTa3Gy6faLBFHCgwsaKijyVVCj8hXswSKAKAKAKAKAKAKAKAKAKAodT4Osbm5W7nt0llVAil8soUEsPYJ5ScsdyKAvQMUBm/GPHczznTtJCyXPSac4MVv4HOxBYfMA7YJ2HPdXVK2pupVeF5vwPUIOTwj12Qahcs2oWt1O9w9vcDEjkkkOCMDJ9kexnl8M16t6yrUo1FzWRKOy8DjxXo4vrOe2OP1sbKCfBsZQ/Jgp+VbjyYpo/aP9GsktmieS+jJgEPK25U8qFj1PgvKPaJXwzmqtc+j7rXjqZxB7+/PNHXG52YY5j3wBwCyP+kNSImvXwwVsFLceCqOnOPMbDoPM2SjRhRgqdNYSOWUnJ5Zo1bTAUAUBQ8bcMRapaPbSbE+1G+MmOQe6w/EgjxBIoDI9I4E1i7aLT78mOyt2y0gYEyqPdVCDltumQOUHfcAVy07KjTrSrRj7T/zzPbnJrZZuVjZxwRrFEgREUKirsAB0ArqPBk3aV2iXSX8Wn2EqRESRLNOwVgJJGwI25gVVQMFj18NsHIGwLQAwztQCBpfZLY29/8ATU5sK3PHAQO7ST7Q8cDqF8DjyFAaBQBQBQC9qXBNhcXSXkturTpghvaAJX3S6g8rkeGQeg8qAYaAKAKAKAq+KdQNrZ3M46xQSOv7yoSPzxQGHcNcZ6ZZaalvIWmd1YzRqhPM0hPMGL4U7YGcnpVXvNMvbm97aLUUsYeeh1wqwjTwxt7Cbm8CTwywTR2gPPamYN7KsxzGGYDnGCDsOufOrPHOFnicjNYrICgCgCgCgCgCgCgCgCgCgCgCgEntcvb6KwYWEcjyOwR2iBaSOMg8zKF3ydlyOgJO2M0Bm/BfGml6fALdo5reQY74yR5Z3xuSVyceQIGBVU1XSb66q7aaa5LOML4nZRrU4LA49is63Daldpust4Qp3GVVcqcHcbOPxqx2lJ0qEIPikkcs3mTZptdB5KqPhyzW4N2LaIXB6y8o5+mM58DjbI3NAWtAFAFAFAFAFAKHanrdzZWDPaRu8zsI1ZEL92GBLSEDpgDAPmwoDHLMTzWLWMOjXUrS+1JcyBwTP173mKY2PQFumc9TmMdlWldesOpuW5RS3YNu3HY2cG3dniXa6fAl8pW4RSrcxDMVViELEE5PKFyc1JmoZKAKAKAKAKAKAKAKAKAKA5XVukqNHIqujAqysAVYHYgg7EUBV6dwpYW7c8Nnbxv4MsSBh8DjIoC5oAoAoAoAoAoAoAoAoAoAoAoAoAoDyawBD7Uf2J/dNZQK7/8Az9/eE3/e5P8AZxVlg0+sAKAKAKAKAKAKAKA+UAGsLiZPi1kweqAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKAKA//9k=");
                setAnswers(response.data.question.answers);
                setQuestion(response.data.question.question);
                // get games
            


              } catch (err) {
                if (err.response.data.error === "Session has not started yet") {
                    setHasStarted(false);
                }
                console.log(err);
                // alert(err.response.data.error);
              }
              
        // Make the API call to fetch question number or anything else you need
      }
    } catch (err) {
        console.log("invaid game go to join game");
      console.log(err);
      alert(err.response.data.error);
    }
  };

  const handleTimeUp = async () => {
    console.log("Time's up! Locking in answer / showing result.");
    setTimesUp(true);
    try {
        const response = await axios.get(`http://localhost:5005/play/${playerId}/answer`)
        console.log(response.data);
    } catch (error) {
         console.log(error);
    }
    // You can lock UI, or send final answer here
  };

  const handleAnswerClick = async (selectedAnswer) => {
    console.log("Selected answer:", selectedAnswer);
    // Send answer to server here using axios.post(...)
    try {
        const response = await axios.put(`http://localhost:5005/play/${playerId}/answer`, {
            answers: [ "answer 1" ],
        });
        console.log(response);
    } catch (error) {
         console.log(error);
    }

  };

  return (
    <>
    {isPlayerValid && (
      <>
        {hasStarted ? (
          <>
            <CountdownTimer duration={duration} onExpire={handleTimeUp} />
            {image && (
                <img
                src={image}
                alt="Question visual"
                className="mx-auto mt-6 max-w-xl max-h-96"
                />
            )}
             <h3 className="mt-5 text-center text-black text-4xl font-bold">{question}</h3>

            {!timesUp && (
                // {answers.length > 0 && (
                    <div className="mt-6 flex flex-col gap-4 items-center">
                {answers.map((answer, idx) => (
                <button
                    key={idx}
                    onClick={() => handleAnswerClick(answer)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200 w-3/4 max-w-xl"
                >
                    {answer}
                </button>
                ))}
            </div>
)}
            {/* )} */}
            
          </>
        ) : (
          <p className="text-center text-2xl font-semibold mt-10">Waiting for game to start ...</p>
        )}
      </>
    )}
  </>
  );
}

export default Play;

