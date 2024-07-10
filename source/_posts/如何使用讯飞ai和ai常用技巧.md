---
title: 如何使用讯飞ai和ai常用技巧
tags:
  - 讯飞星火大模型
  - ai提问常用技巧
  - 接入ai
categories:
  - 编程经验
mathjax: true
ticky: 2
description: ⭐本篇文章主要介绍了如何接入讯飞ai，还有对ai提问的常用技巧⭐
cover: https://bu.dusays.com/2024/07/09/668d53bbd6661.jpg
abbrlink: e09b9d02
date: 2024-07-09 23:07:55
---



参考文章：

{% link  如何使用api接入星火大模型,https://blog.csdn.net/weixin_56649281/article/details/136569427 , https://s21.ax1x.com/2024/07/09/pkf2su4.png }

## 1. 接入讯飞ai

---

## 

### 1.1 进入星火：https://xinghuo.xfyun.cn/desk

[![pkf2su4.png](https://s21.ax1x.com/2024/07/09/pkf2su4.png)](https://imgse.com/i/pkf2su4)

---



### 1.2  注册账号,创建应用

[![pkfRnr4.png](https://s21.ax1x.com/2024/07/10/pkfRnr4.png)](https://imgse.com/i/pkfRnr4)

[![pkfRuqJ.png](https://s21.ax1x.com/2024/07/10/pkfRuqJ.png)](https://imgse.com/i/pkfRuqJ)

---



### 1.3选择你要接入的服务我这里是接入了Spark Pro服务 进行购买，新手会松一年的免费试用

[![pkfcxFP.png](https://s21.ax1x.com/2024/07/09/pkfcxFP.png)](https://imgse.com/i/pkfcxFP)

---

### 1.3点击创建的应用，查看APPID，APISecret和APIKey

## 2 引入科大讯飞星火认知大模型 Java SDK

{% cell 讯飞大模型javaSDK,https://github.com/briqt/xunfei-spark4j,  %}

---



使用方式:

>
>
>### 引入项目
>
>```yaml
><!--修改version为最新稳定版-->
>
><dependency>
>    <groupId>io.github.briqt</groupId>
>    <artifactId>xunfei-spark4j</artifactId>
>    <version>1.2.0</version>
></dependency>
>```

---



### 创建客户端

```java
package com.miku.config;

import io.github.briqt.spark4j.SparkClient;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "miku.ai")
@Data
public class XunFeiConfig {

    private String appid;
    private String apikey;
    private String secretkey;

    @Bean
   public SparkClient sparkClient(){
        SparkClient client = new SparkClient();
        client.appid=appid;
        client.apiKey=apikey;
        client.apiSecret=secretkey;
        return client;
    }
}
//记得配置appid apikey secretkey 等 在yaml文件里面 前缀是 miku.ai

```

---



### 同步调用

```java
package com.miku.utils;


import io.github.briqt.spark4j.SparkClient;
import io.github.briqt.spark4j.constant.SparkApiVersion;
import io.github.briqt.spark4j.exception.SparkException;
import io.github.briqt.spark4j.model.SparkMessage;
import io.github.briqt.spark4j.model.SparkSyncChatResponse;
import io.github.briqt.spark4j.model.request.SparkRequest;
import io.github.briqt.spark4j.model.response.SparkTextUsage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SparkUtils {

    @Autowired
    private SparkClient sparkClient;


    /**
     * 同步调用ai工具类
     *
     * @param systemContent- 系统预设内容
     * @param userContent-   用户输入内容
     * @return
     */
    public  String synchronousCalls(String systemContent, String userContent) {
        List<SparkMessage> messages = new ArrayList<>();
        messages.add(SparkMessage.systemContent(systemContent));
        messages.add(SparkMessage.userContent(userContent));
        // 构造请求
        SparkRequest sparkRequest = SparkRequest.builder()
                // 消息列表
                .messages(messages)
                // 模型回答的tokens的最大长度,非必传，默认为2048。
                // V1.5取值为[1,4096]
                // V2.0取值为[1,8192]
                // V3.0取值为[1,8192]
                .maxTokens(2048)
                // 核采样阈值。用于决定结果随机性,取值越高随机性越强即相同的问题得到的不同答案的可能性越高 非必传,取值为[0,1],默认为0.5
                .temperature(0.2)
                // 指定请求版本，默认使用最新3.0版本
                .apiVersion(SparkApiVersion.V3_0)
                .build();
        try {
            // 同步调用
            SparkSyncChatResponse chatResponse = sparkClient.chatSync(sparkRequest);
            SparkTextUsage textUsage = chatResponse.getTextUsage();

            System.out.println("\n回答：" + chatResponse.getContent());
            System.out.println("\n提问tokens：" + textUsage.getPromptTokens()
                    + "，回答tokens：" + textUsage.getCompletionTokens()
                    + "，总消耗tokens：" + textUsage.getTotalTokens());
            return chatResponse.getContent();
        } catch (SparkException e) {
            System.out.println("发生异常了：" + e.getMessage());
        }
        return "调用失败";
    }

}

```

---

### 调用示例

```java
 @Resource
    private SparkUtils sparkUtils;


    /**
     * 调用ai服务生成智能生成
     *
     * @param multipartFile
     * @param aiRequest
     * @param request
     * @return
     */
    @ApiOperation(value = "调用ai服务生成智能生成图表和结论")
    @PostMapping("/generate")
    public BaseResponse<String> genSmartChart(@RequestPart("file") MultipartFile multipartFile,
                                              GenerByAiRequest aiRequest, HttpServletRequest request) {
        String name = aiRequest.getName();
        String goal = aiRequest.getGoal();
        String chartType = aiRequest.getChartType();

        User loginUser = userService.getLoginUser(request);
        //用户输入
        StringBuilder userInput= new StringBuilder();
        userInput.append("分析目标:"+goal).append("\n");
        if (StringUtils.isNotBlank(chartType)){
            userInput.append("图表类型:"+chartType).append("\n");
        }
        userInput.append("名称:"+name).append("\n");
        //校验
        ThrowUtils.throwIf(StringUtils.isBlank(goal), ErrorCode.PARAMS_ERROR, "目标不能为空");
        ThrowUtils.throwIf(StringUtils.isNotBlank(name)&&name.length()>100,ErrorCode.PARAMS_ERROR,"图表名称不能超过100个字符");

        //压缩Excel数据
        String excelCsv = ExcelUtils.excelCsv(multipartFile);
        userInput.append("数据:").append(excelCsv).append("\n");
        //读取用户上传的excel文件 并且处理
        String result = sparkUtils.synchronousCalls(AiConstant.MATH_MAP, userInput.toString());

        return ResultUtils.success(userInput.toString());
    }
```



---



## Ai调用技巧

### 1. 压缩原始数据

> 因为别人提供的ai接口有字数限制，所以咱们需要将用户传过来的数据进行压缩， 接口普遍都有输入字数限制。所以我们要尽可能压缩数据，能够允许多传一些数据。

AI压缩除了后台自己压缩外，还可以调用ai服务，让ai帮你进行压缩数据

```java
Al提词技巧1:持续输入,持续优化

第一次问:
我给你三行数据，请帮我分析网站的增长趋势，数据如下:
第一行:日期: 1号, 用户数: 10人
第二行:日期: 2号，用户数: 20人
第三行:日期: 3号，用户数: 30人

Al答:
根据给出的数据，我们可以看出这个网站的用户数在三天内呈现快速增长的趋势。
具体来说,该网站用户数从第一天的10人增长到第二天的20人，增加了10人，
增长率为100%;相比之下,第三天用户数从第二天的20人增长到第三天的30人，
增加了同样的10人，增长率降至50%。如果这种增长趋势持续下去,我们可以
预期该网站在未来几天内还会继续吸引更多用户。当然，若要得出更加准确
的结论,需要更多数据的支持。
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
AI提词技巧2:数据压缩(内容压缩，比如把很长的内容提取关键词,也可以让Al来做)

第二次问:
我给你三行数据，请帮我分析网站的增长趋势，数据如下:
表头:日期,用户数
1号,10
2号,20
3号,30

Al回答:
根据给出的数据，我们可以计算出每日用户增长量:
● 第一天增长了10个新用户;
● 第二天增长了20 - 10=10个新用户;
● 第三天增长了30 - 20=10个新用户。
可以看出，每天的用户增长量都相等，呈现一个线性增长趋势。如果这个网站
在未来的时间里能够保持现在的增长速度和策略不变,预计每过一天会增加10个
用户。但需要注意的是,这个预测是基于目前的数据情况，实际情况受到许多因
素的影响，不能完全准确预测未来用户增长。
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
使用Al压缩

第三次问:
我给你三行数据，请帮我用最少的字数压缩这段数据
第一行:日期: 1号, 用户数: 10人
第二行:日期: 2号，用户数: 20人
第三行:日期: 3号，用户数: 30人

Al回答:
日期1-3号,用户数分别为10/20/30人
```

---

### 2. 为了让 Al 更好地理解我们的输入，并给出预期精确的输出，需要严格控制我们的提问词。

- 使用系统预设 + 控制输入格式(便于Al精确地理解我们的需求)

  ```
  你是一个数据分析师和前端开发专家，接下来我会按照以下固定格式给你提供内容：
  分析需求:
  {数据分析的需求或者目标}
  原始数据:
  {csv格式的原始数据，用,作为分隔符}
  请根据以上内容，帮我生成数据分析结论和可视化图表代码
  分析需求：
  分析网站用户的增长情况
  原始数据：
  日期,用户数
  1号,10
  2号,20
  3号,30
  
  
  
  ```

  ### 3. 控制输出格式(便于 AI 返回的内容能够更加方便地为我们所用)

```
你是一个数据分析师和前端开发专家，接下来我会按照以下固定格式给你提供内容：
分析需求：
{数据分析的需求或者目标}
原始数据：
{csv格式的原始数据，用,作为分隔符}
请根据这两部分内容，按照以下指定格式生成内容（此外不要输出任何多余的开头、结尾、注释）
【【【【【
{前端 Echarts V5 的 option 配置对象js代码，合理地将数据进行可视化，不要生成任何多余的内容，比如注释}
【【【【【
{明确的数据分析结论、越详细越好，不要生成多余的注释}
```

生成结论：

```java
【【【【【
{
    title: {
        text: '网站用户增长情况',
        subtext: ''
        },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
            }
    },
    legend: {
        data: ['用户数']
        },
    xAxis: {
        data: ['1号', '2号', '3号']
    },
    yAxis: {},
    series: [{
        name: '用户数',
        type: 'bar',
        data: [10, 20, 30]
    }]
}
【【【【【
根据数据分析可得，该网站用户数量逐日增长，时间越长，用户数量增长越多。
   
```

- 指定一个示例问答，one-shot 或者 few-shot。

> one-shot：给 AI 一轮示例问答
>
> ew-shot：给 AI 多轮示例问答



### **总结：智能接口实现**

**后端流程：**

- 构造用户请求（用户消息、csv 数据、图表类型）
- 调用讯飞大模型sdk，得到 AI 响应结果。
- 从 AI 响应结果中，取出需要的信息。
- 保存图表到数据库。



{% progress 100 blue 文章结束！  %}

