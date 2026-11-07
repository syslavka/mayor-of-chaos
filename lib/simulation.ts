export type Action = "deny" | "evidence" | "blame";
export type News = { id:number; time:number; tag:string; title:string; body:string; kind:"news"|"decision"; urgent?:boolean };
export type City = { event:string; subject:string; symbol:string; seconds:number; step:number; chaos:number; trust:number; cult:number; price:number; prices:number[]; districts:number[]; news:News[]; decisions:Record<Action,number>; paused:boolean; speed:number };
export const districtNames=["Тихий центр","Спальный район","Промзона","Старый город","Заречье","Новая слобода"];
export const actionNames:Record<Action,string>={deny:"Выпустить опровержение",evidence:"Подбросить улику",blame:"Назначить виновного"};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function subjectOf(event:string):[string,string]{
 const choices:[RegExp,string,string][]=[[/ложк/i,"ложка","ЛЖК"],[/кофе/i,"кофе","КФЕ"],[/кот|кошк/i,"кот","КОТ"],[/носо?к|носк/i,"носок","НСК"],[/ключ/i,"ключ","КЛЧ"],[/автобус/i,"автобус","АВТ"],[/хлеб/i,"хлеб","ХЛБ"],[/телефон/i,"телефон","ТЛФ"],[/чашк/i,"чашка","ЧШК"],[/суп/i,"суп","СУП"]];
 const m=choices.find(([re])=>re.test(event));return m?[m[1],m[2]]:["случайность","СЛЧ"];
}
export function createCity(event="Я уронил ложку"):City{
 const [subject,symbol]=subjectOf(event);
 return {event,subject,symbol,seconds:0,step:0,chaos:38,trust:64,cult:247,price:142.8,prices:[81,88,86,96,90,106,101,118,112,129,124,142.8],districts:[42,20,58,67,28,35],decisions:{deny:0,evidence:0,blame:0},paused:false,speed:1,news:[
 {id:3,time:0,tag:"ЭКСТРЕННО",title:"Город проснулся в новой реальности",body:`«${event}». Мэрия созвала экстренное заседание. Жителей просят сохранять спокойствие и не делать из этого событие.`,kind:"news",urgent:true},
 {id:2,time:0,tag:"ОБЩЕСТВО",title:"Очевидцы расходятся во всём, кроме уверенности",body:`В Старом городе собрались 247 человек, уверенных: ${subject} — лишь отвлекающий манёвр. У движения уже есть чат и бухгалтер.`,kind:"news"},
 {id:1,time:0,tag:"ЭКОНОМИКА",title:`${symbol}: торги открылись нервно`,body:"Инвесторы скупают всё, что связано с происшествием. Эксперты рекомендуют задумчиво смотреть на график.",kind:"news"}]};
}
function addNews(c:City,news:Omit<News,"id"|"time">):City{return {...c,news:[{...news,id:Math.max(0,...c.news.map(n=>n.id))+1,time:c.seconds},...c.news].slice(0,150)}}
export function advance(c:City,seconds=1):City{
 if(c.paused)return c;
 const end=c.seconds+seconds;
 let n={...c,seconds:end};
 for(let t=Math.floor(c.seconds/12)+1;t<=Math.floor(end/12);t++)n=nextEvent({...n,seconds:t*12});
 return {...n,seconds:end};
}
function nextEvent(c:City):City{
 const step=c.step+1,d=(step*7)%6,phase=Math.min(4,Math.floor(c.seconds/120));
 const delta=2+phase+(c.decisions.evidence>c.decisions.deny?2:0);
 const price=Number(Math.max(3,c.price*(1+Math.sin(step*2.7)*.065+c.chaos/2300)).toFixed(2));
 const n={...c,step,chaos:clamp(c.chaos+delta),trust:clamp(c.trust-(step%3===0?2:0)),cult:c.cult+13+phase*19+c.decisions.evidence*3,price,prices:[...c.prices.slice(-29),price],districts:c.districts.map((v,i)=>clamp(v+(i===d?8:1)))};
 const entries=[
 ["СВИДЕТЕЛИ",`В районе «${districtNames[d]}» найден второй очевидец`,`Он подтверждает: «${c.event}». Правда, в это время он был в другом городе. Его уже пригласили на телевидение.`],
 ["ПОЛИТИКА","Мэр: «Ситуация под контролем ситуации»","Создан комитет по изучению происшествия. Первое заседание посвящено выбору названия комитета."],
 ["ОБЩЕСТВО",`${n.cult.toLocaleString("ru-RU")} жителей сомневаются в официальной версии`,c.decisions.deny?"После опровержения движение объявило молчание мэрии самым громким доказательством. То, что мэрия говорила, никого не смутило.":"Движение «Ничего не было» открыло штаб. Вход свободный, выход — после короткой лекции на четыре часа."],
 ["ЭКОНОМИКА",`${c.symbol} стал защитным активом`,"На бирже введены торги воспоминаниями о нормальной жизни. Курс стабилен: нормальной жизни никто не помнит."],
 ["РАЙОНЫ",`«${districtNames[d]}» требует объяснений`,c.decisions.blame?"Жители не согласны с назначенным виновным и назначили своего. Теперь в городе две несовместимые версии виновности.":"Митингующие требуют вернуть всё как было. Что именно было, решат на следующем митинге."],
 ["КУЛЬТУРА","Историки объявили начало новой эпохи",`Событие «${c.event}» войдёт в школьную программу. На контрольной нужно будет выбрать правильного очевидца.`],
 ["РАССЛЕДОВАНИЕ",c.decisions.evidence?"Подброшенная улика дала показания против мэрии":"Архивы показали: предпосылки были всегда",c.decisions.evidence?"Эксперты заметили на улике печать канцелярии. Мэрия пояснила: улики тоже имеют право на документооборот.":`Найден документ 1897 года со словом «${c.subject}». Совпадение признано слишком убедительным, чтобы его проверять.`],
 ["ЭКСТРЕННО",phase>=2?"Город подал заявку на независимость от здравого смысла":"Объявлен повышенный уровень неопределённости",phase>=2?"Флаг уже нарисован. Гимн пока состоит из вопросов. Соседний город направил делегацию психотерапевтов.":"Горожанам рекомендовано держать при себе документы и запасную версию происходящего."],
 ["ГОРОДСКАЯ ЖИЗНЬ","В городе открыли первый музей происшествия",`Главный экспонат — табличка «Здесь могла быть ${c.subject}». Очередь растянулась до отдела опровержений.`],
 ["ПОЛИТИКА",c.decisions.deny>1?"Опровержение опровержения отправлено на доработку":"Мэрия обещает завтра объяснить вчера",`Пресс-секретарь попросил не вырывать «${c.event}» из контекста. Контекст засекречен до выяснения контекста.`]
 ];
 const [tag,title,body]=entries[(step-1)%entries.length];return addNews(n,{tag,title,body,kind:"news",urgent:tag==="ЭКСТРЕННО"});
}
export function intervene(c:City,action:Action):City{
 const count=c.decisions[action]+1;
 const n={...c,decisions:{...c.decisions,[action]:count},districts:c.districts.map((v,i)=>clamp(v+(action==="deny"?-6:action==="evidence"?9:(i%2===0?-8:12)))),chaos:clamp(c.chaos+(action==="deny"?-7:action==="evidence"?11:5)),trust:clamp(c.trust+(action==="deny"?4:action==="evidence"?-6:-9)),cult:c.cult+(action==="deny"?38:action==="evidence"?79:24)};
 const suspects=["голубь Геннадий","дежурный по совпадениям","заместитель по необъяснимому","ретроградный Меркурий"];
 const data:Record<Action,[string,string]>={deny:[count===1?"Мэрия официально заявляет: ничего не произошло":`Выпущено опровержение №${count}. Предыдущие остаются в силе`,`Напряжение снизилось, доверие выросло. Но ещё 38 жителей решили, что раз мэрия отрицает «${c.event}», значит, всё гораздо серьёзнее.`],evidence:[`Обнаружена «случайная» улика №${count}`,`На месте происшествия найдена записка: «${c.subject} знает слишком много». Напряжение растёт. Движение отрицателей получило 79 сторонников.`],blame:[`Виновный назначен: ${suspects[(count-1)%suspects.length]}`,"Часть районов выдохнула, остальные вышли на улицы. Доверие к мэрии упало: жители подозревают, что виновный выбран по алфавиту."]};
 return addNews(n,{tag:"ВАШЕ РЕШЕНИЕ",title:data[action][0],body:data[action][1],kind:"decision"});
}
export function validCity(v:unknown):v is City{
 if(!v||typeof v!=="object")return false;const c=v as City;
 return typeof c.event==="string"&&!!c.event&&typeof c.subject==="string"&&typeof c.symbol==="string"&&[c.seconds,c.step,c.chaos,c.trust,c.cult,c.price].every(Number.isFinite)&&Array.isArray(c.news)&&c.news.every(n=>typeof n.title==="string"&&typeof n.body==="string"&&Number.isFinite(n.id)&&Number.isFinite(n.time))&&Array.isArray(c.districts)&&c.districts.length===6&&c.districts.every(Number.isFinite)&&Array.isArray(c.prices)&&c.prices.length>1&&c.prices.every(Number.isFinite)&&!!c.decisions&&[c.decisions.deny,c.decisions.blame,c.decisions.evidence].every(Number.isFinite)&&[1,2,4].includes(c.speed)&&typeof c.paused==="boolean";
}
