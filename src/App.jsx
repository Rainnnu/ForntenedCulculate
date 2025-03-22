import { useState } from "react";
import "./App.css";
import instance from './Fetch'

function App() {
  const [canGrade, setCanGrade] = useState(false); //是否可以获取答案
  const [question, setQuestions] = useState([]); //题目数组
  const [loading, setLoading] = useState(false); //加载状态
  // 初始化状态数组，长度与问题数量一致
  const [answers, setAnswers] = useState(new Array(question.length).fill(""));
  const [correctIndex, setCorrectIndex] = useState([]); //记录错误题号

  // 定义一个函数，根据 index 返回不同的样式
  const getStyle = (index) => {
    // 根据 index 设置不同的样式
    if (correctIndex.includes(index)) return { color: "green" };
    return null;
  };

  //获取题目
  async function GenerateExercises() {
    const num = document.getElementById("num").value;
    const range = document.getElementById("range").value;

    if (num <= 0 || num == "" || Number(num) !== parseInt(num)) {
      alert("题目数量应为大于0的整数！");
      return;
    }
    if (range <= 0 || range == "" || Number(range) !== parseInt(range)) {
      alert("数值范围应为大于0的整数！");
      return;
    }

    setLoading(true); //加载


    instance.get(`/exercises/getExercises?num=${num}&max=${range}`)
    .then(response => {
      const data =response.data
      console.log('返回的数据:', data);
      // 在这里处理返回的数据
      setQuestions(data);
      setCanGrade(true);
      setCorrectIndex([])
      setAnswers(new Array(data.length).fill(""));
    })
    .catch((err) => {
      alert('获取题目失败!\n'+err );
    }).finally(()=>{
      //取消加载状态
      setLoading(false);

    });
  }

  //处理文件上传
  const handleFile=()=>{
    const  exerciseFilePath=document.querySelector("#exerciseFilePath").value;
    const  answerFilePath=document.querySelector("#answerFilePath").value;
    instance.post('/exercises/correctingExercises?',{exerciseFilePath,answerFilePath}
    ).then((res) => {
     alert("上传成功！")
    }).catch((err)=>{
     alert("上传失败！\n"+err)
    });
  }

  //输入合法性检验
  const validateFraction = (input) => {
    // 去除多余的空格
    const trimmedInput = input.replace(/\s+/g, " ").trim();

    // 首先验证输入值是否只包含数字、'、/ 和空格
    if (!/^[0-9'\/\s]+$/.test(trimmedInput)) {
      return false;
    }

    // 检查是否包含 '/'
    if (!trimmedInput.includes("/")) {
      // 如果没有 '/'，直接返回是否为非负整数
      return !isNaN(trimmedInput) && parseInt(trimmedInput, 10) >= 0;
    }

    // 分割整数部分和分数部分
    const parts = trimmedInput.split("'");
    let integerPart = "";
    let fractionPart = "";

    if (parts.length === 1) {
      // 只有分数部分
      fractionPart = parts[0];
    } else if (parts.length === 2) {
      // 带分数形式
      integerPart = parts[0];
      fractionPart = parts[1];
    } else {
      // 非法格式
      return false;
    }

    // 验证整数部分
    if (
      integerPart !== "" &&
      (isNaN(integerPart) || parseInt(integerPart, 10) < 0)
    ) {
      return false;
    }

    // 验证分数部分
    const [numerator, denominator] = fractionPart.split("/");

    // 验证分子和分母是否为自然数
    if (
      isNaN(numerator) ||
      isNaN(denominator) ||
      parseInt(numerator, 10) <= 0 ||
      parseInt(denominator, 10) <= 0
    ) {
      return false;
    }

    const num = parseInt(numerator, 10);
    const den = parseInt(denominator, 10);

    // 分子和分母必须是正整数，且分子小于分母
    return num < den;
  };

  //校验答案、发送答案、获取评分
  async function gradeAnswers(e) {
  
    answers.map((item) => {
      // 验证输入值是否符合规则
      if (!(item === "" || validateFraction(item))) {
        // 不符合规则
        alert("答案应为自然数或真分数，请检查您的答案！");
        return;
      }
    });

    //数据格式正确，向后端发送数据请求答案
    instance.post('/exercises/getAnswer?',{answer:answers}
    ).then((res) => {
      const data = res.data;
      setCorrectIndex(data.correct);
      const rightString = data.correctNumber ? "题号为：" + data.correct.map(item => item + 1).join(",") : '';
      const wrongString = data.errorNumber?"题号为："+ data.error.map(item => item + 1).join(",") : '';

      const result = 
      alert("评分结果：\n共答对"+ [data.correctNumber]+"题 "+rightString+
        "\n共答错"+ [data.errorNumber]+"题 "+wrongString);
    }).catch((err)=>{
      alert("获取评分失败！\n"+err)
    });
  }

  // 处理输入框的值变化
  const handleChange = (index, e) => {
    const value = e.target.value;
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = value;
      return newAnswers;
    });
  };



  return (
    <div>
      <h1>四则运算题目生成器</h1>
      <header className="head">
        <div className="flex">
          <label htmlFor="num">题目数量：</label>
          <input type="number" id="num" name="num" />
          <label htmlFor="range">数值范围：</label>
          <input type="number" id="range" name="range" />
          <button onClick={GenerateExercises}>生成题目</button>
          
        </div>
     

      </header>
        
     
      <div className="filebox">
      <div>(可输入对应地址进行判定答案中的对错并进行数量统计操作,输入示例C://Users//Aurora//Desktop//Exercises.txt)</div>
        <div className="fileinput">
          <div>
          <label htmlFor="exerciseFilePath">题目文件路径:</label>
        <input name="exerciseFilePath" id="exerciseFilePath"  />
        </div>
        <div>
          <label htmlFor="answerFilePath">答案文件路径:</label>
        <input  name="answerFilePath" id="answerFilePath" />
        </div>
        <div><button onClick={handleFile}>确定</button></div>

        </div>
      </div>

      <form>
        {loading ? (
          <div className="loadbox">Loading...</div>
        ) : (
          <div>
            <div className="main">
              {question.map((item, index) => {
                return (
                  <div key={index}>
                    <span style={getStyle(index)}>
                      ({index+1}) {item}=
                    </span>
                    <input
                      className="anser"
                      value={answers[index]}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="btnbox">
              {canGrade && (
                <button onClick={gradeAnswers} type="button" className="gradebtn">
                  获取评分
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
