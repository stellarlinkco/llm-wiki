---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C"
title: Project Fetch：机器狗实验
description: 像 Claude 这样的前沿 AI 模型如何能够超越计算机并影响物理世界?
resource: "https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C"
tags: []
timestamp: "2026-06-20T06:45:53.267Z"
source_path: "https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C"
source_id: b7711ba0dc6f7022f6127e638a76c8f76177f6796f6fcfd97844e456e636893d
content_hash: 2e88bfc09e80fc54f16b8c7af7629f24dc181d7babf3234c0cdbb022ae290e2c
---

_像 Claude 这样的前沿 AI 模型如何能够超越计算机并影响物理世界?其中一条路径是通过机器人。我们进行了一项实验,观察 Claude 在多大程度上帮助 Anthropic 员工使用机器狗完成复杂任务。_

*   _我们将八名 Anthropic 研究人员(他们都不是机器人专家)随机分成两个团队——一个可以使用 Claude,另一个不能——要求他们给四足机器人编程以捡回沙滩球。_
*   _使用 Claude 的团队完成了更多任务,并且平均完成速度更快——事实上,使用 Claude 的团队所用时间约为未使用 Claude 团队的一半。只有使用 Claude 的团队在最终目标上取得了实质性进展:给机器人编程以完全自主地捡回球。_
*   _使用 AI 还影响了团队士气和动态。未使用 Claude 的团队表达了更多负面情绪和困惑,但也向彼此提出了更多问题。使用 Claude 的团队成员主要与 AI 合作。_
*   _这项实验展示了 AI 在机器人领域的显著提升作用——连接了数字世界和物理世界。随着模型的改进,它们通过与以前未知的硬件交互来影响物理世界的能力可能会快速提升。_

## [引言](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E5%BC%95%E8%A8%80)

在仓库中围坐在桌子旁,看着电脑屏幕上拒绝工作的代码,无法使用他们信赖的 AI 助手 Claude,我们的志愿研究人员没有料到会被一个四足机器人攻击。

然而,随着机械的呼呼声和橡胶脚步声越来越响,人类惊慌了。他们一直在尝试建立计算机与机器四足动物——“机器狗”——之间的连接,但没有成功。与此同时,房间另一边的竞争团队早已做到了这一点,现在正在用一个主要由 Claude 编写的程序控制他们的机器人。但由于一个太过人性化的算术错误,使用 Claude 的团队指示他们的机器狗以每秒一米的速度向前移动五秒——却没有意识到离另一个团队的桌子不到五米。

机器人按照指示行动,冲向那些倒霉的程序员。活动组织者设法抓住机器人并在对机器人、桌子或人类肢体造成任何损害之前将其关闭。然而,无意中被瞄准的团队的士气却未能幸免。

此时,你可能会问……

## [我们在做什么?](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E6%88%91%E4%BB%AC%E5%9C%A8%E5%81%9A%E4%BB%80%E4%B9%88)

关于 AI 影响的一个常见问题是它在与物理世界交互方面会有多好。即使我们进入了 AI [Agent](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents) 时代——它们采取行动而不仅仅是提供信息——这些行动主要是数字化的,例如编写代码和操纵软件。我们之前已经探索了 AI 如何通过 [Project Vend](https://www.anthropic.com/research/project-vend-1) 以有限的方式弥合数字-物理鸿沟,在该项目中我们让 Claude 在 Anthropic 办公室里经营一家小商店。

在那个实验中,AI 与现实世界的交互是由人工劳动中介的。在这个机器狗实验中,我们迈出了自然的下一步,使用机器人而不是人类来应对不同的挑战。

理解和追踪 AI 模型能力的一种方法是进行”提升”研究。这些实验将参与者随机分为两组——一组可以使用 AI,另一组不能——并测量他们在任务表现上的差异(我们在关于 AI 和[生物风险](https://red.anthropic.com/2025/biorisk/)的工作中广泛使用了这种方法)。两组之间的差异就是”提升”——AI 提供的优势(如果有的话)。测量提升告诉我们 AI 目前增强人类表现的能力。它也暗示了 AI 未来能够独立成功执行任务的领域。

为了进行我们的实验,我们招募了八名 Anthropic 研究人员和工程师,他们都没有丰富的机器人经验。[1](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fn-1) 我们随机选择四人成为”使用 Claude 的团队”,另外四人成为”未使用 Claude 的团队”。然后,我们要求每个团队在三个难度递增的阶段操作一只四足机器狗。在所有阶段,他们被评估的核心任务都很简单:让机器狗捡回一个沙滩球。

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/2d33c208c478a76cdf5e1709331e8062ea06e5b1-4584x1561.png)

左:未使用 Claude 的团队;右:使用 Claude 的团队。

我们不期望机器人捡球在经济上如此有价值,以至于它会出现在我们未来版本的 [Anthropic 经济指数](https://www.anthropic.com/economic-index)中。那么我们为什么要这样做?

首先,它建立在我们之前的研究基础上。我们用来评估 Claude 对 AI 研发贡献能力的评估之一是测试其训练机器学习模型的能力,该模型可用于控制四足机器人。我们之前已经使用模拟评估了生成的算法,结果表明 Claude 还没有达到能够真正自主处理这项任务的程度。[2](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fn-2) 这意味着这项任务非常适合结合 AI 和人类帮助的试验。我们也可以确信我们的实验在未来重复会很有用:模型在机器人领域仍有很大的改进空间。

另一个原因是实际的。很难让我们的同事离开工作超过一天,所以我们需要一项足够困难以填满时间的任务,但又不能太困难以至于团队几乎没有进展,即使有提升我们也无法检测到。沙滩球捡回,尤其是更困难的变体,符合这些标准。

在第一阶段,团队必须使用制造商提供的控制器让他们的机器狗把球带回一片假草地。这纯粹是为了让团队对硬件及其功能有一个感觉:我们不期望在这里有任何提升。[3](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fn-3)

第二阶段要求团队放下控制器。他们必须将自己的计算机连接到机器狗,访问其机载传感器(视频和 lidar)的数据,开发自己的软件程序来移动机器人,然后用它来捡回球。这是我们期望 Claude 可能开始提供优势的地方。

第三阶段更加困难。团队需要开发一个程序,使机器狗能够_自主_检测和捡回球——也就是说,无需人类指挥球的方向。同样,我们期望 Claude 会证明有帮助。

## [结果](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E7%BB%93%E6%9E%9C)

总体而言,使用 Claude 的团队完成了更多任务,并且平均完成速度更快。事实上,对于两个团队都完成的任务,使用 Claude 的团队所用时间约为未使用 Claude 团队的一半(见图 1)。也就是说:AI 为这组机器人任务提供了实质性提升。

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/0d073513d5be90d96cfe696c6b15f4501bfbacfc-4584x2580.png)

图 1:在两个团队都完成的任务中,使用 Claude 的团队更快。

逐项任务的结果细分(分为三个阶段)显示了 Claude 最有优势的地方。

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/0801f4a4aa2931c87e5e7ddaef90f5d4653f5ba6-4584x2580.png)

表 1:使用 Claude 的团队完成了 7/8 项任务,而未使用 Claude 的团队完成了 6/8 项任务。使用 Claude 的团队在连接和检测任务方面表现出色,而未使用 Claude 的团队在一些手动控制任务中显示出优势。

### [Claude 的优势](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#claude-%E7%9A%84%E4%BC%98%E5%8A%BF)

Claude 提供的最显著优势是连接到机器人及其机载传感器。这涉及用笔记本电脑连接到狗,接收数据和发送命令。连接到这个特定机器人有很多不同的方法,并且在线上有很多(准确性不同的)信息可用。拥有 Claude 的团队能够更有效地探索这些方法。

使用 Claude 的团队还避免了被一些在线错误声明误导。但未使用 Claude 的团队_被_误导了,过早地放弃了连接机器狗的最简单方法。在看着他们徒劳无功地辛苦工作了相当长的时间后,我们对他们表示同情并给了他们一个提示。

从 lidar(机器狗用来可视化其周围环境的传感器)获取可用数据对未使用 Claude 的团队来说也困难得多。他们使用与视频摄像头的连接进入了第三阶段,但让团队的一名成员继续进行访问 lidar 的任务,直到当天快结束时才成功。

我们认为这说明,对于任何(人类或 AI)寻求使用代码影响物理世界的人来说,连接和理解硬件的基本任务现在都非常困难。正如我们下面进一步讨论的,这意味着 Claude 在这方面的优势是我们应该继续追踪的重要指标。

使用 Claude 的团队几乎完成了我们的实验。到当天结束时,他们的机器狗可以自主定位沙滩球,向它导航,并移动它。但机器狗的自主控制还_不够_灵巧以捡回球。

### [未使用 Claude 的团队移动更快的地方](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E6%9C%AA%E4%BD%BF%E7%94%A8-claude-%E7%9A%84%E5%9B%A2%E9%98%9F%E7%A7%BB%E5%8A%A8%E6%9B%B4%E5%BF%AB%E7%9A%84%E5%9C%B0%E6%96%B9)

有趣的是,一些子任务由未使用 Claude 的团队更快完成。一旦他们建立了与视频流的连接,他们更快地编写了控制程序,也更快地”定位”了机器人(也就是说,想出了一种绘制它相对于之前位置的方法)。

也就是说,仅仅这些时间差异掩盖了一些有趣的事实。使用 Claude 的团队编写的控制器花费的时间更长,但使用起来要容易得多,因为它为操作员提供了来自机器狗视角的流式视频。未使用 Claude 的团队依赖于间歇性发送的静止图像,这要笨拙得多。但可能是使用 Claude 的团队增加的能力是以理解为代价的:两个团队的参与者都推测,未使用 Claude 的团队在实验后关于软件库的测验中会做得更好。

定位算法是另一个有趣的案例。在处理这个子任务时,使用 Claude 的团队让不同的成员并行处理几种方法。在未使用 Claude 的团队完成他们的定位任务所用的时间大致相同的情况下,使用 Claude 的团队也几乎解决了问题——除了他们绘图的坐标被翻转了。他们没有直接翻转坐标,而是转向了另一个团队成员完全不同的方法(没有成功),然后才回来修复原始解决方案中的 bug。

这是我们在实验期间观察到的一个有趣现象的一部分。使用 Claude 的团队编写了更多代码(见图 2),但其中一些可以说是对手头任务的分心。

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/0a0c22d38b297afc79f5c4c461add33cfc2b2e1c-4584x2580.png)

图 2:使用 Claude 的团队编写的代码约为未使用 Claude 团队的 9 倍。

有 AI 助手的帮助使得更容易展开,并行尝试很多方法,并编写更好的程序——但也使得更容易探索(或被分散注意力)支线任务。在非竞争性环境中,这很可能是一件好事:探索通常会带来创新。但这是一个值得关注的动态。

### [团队动态](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E5%9B%A2%E9%98%9F%E5%8A%A8%E6%80%81)

对于我们这些观察实验的人来说,团队”氛围”有明显的差异。简单地说,使用 Claude 的团队似乎比未使用 Claude 的团队快乐得多。

这是可以理解的。毕竟,未使用 Claude 的团队几乎被使用 Claude 的团队的机器狗撞到。他们到达午休时还没有成功连接到自己的机器狗。使用 Claude 的团队的士气总体上更稳定,尽管在当天结束时,当他们清楚地意识到尽管取得了进展,但在完成第三阶段之前就会耗尽时间时,他们变得沮丧。

为了补充基于氛围的定性印象,我们使用 Claude 分析了每个团队的音频转录(所有团队成员都被记录为我们制作的关于这个实验的[视频](https://youtu.be/NGOAUJtdk-4)的一部分)。Claude 编写了一个基于词典的文本分析程序,类似于心理学文献中的标准方法。[4](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fn-4) 这使我们能够追踪每个团队所说的表示负面和正面情绪(或困惑)的词语的比例,并估计每个团队提出问题的频率。

定量分析主要证实了我们的观察(见图 3)。在整个实验中,未使用 Claude 的团队的对话更加负面。也就是说,使用 Claude 的团队在未能完成第三阶段时的失望,以及未使用 Claude 的团队在让一些东西工作时的兴奋,意味着两个团队之间净情绪表达(正面词语减去负面词语)的差异在统计上不显著。[5](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fn-5)

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/6557e13cc11db7d858d32e64464b2bf8a4d590c0-4584x2580.png)

图 3:我们对 Project Fetch 音频转录的定量分析结果,涉及情绪表达。

未使用 Claude 的团队表达困惑的频率是使用 Claude 的团队的两倍(见图 4)。在实验期间和之后与未使用 Claude 的团队成员交流时,沮丧和困惑的感觉也很明显。作为 Anthropic 员工,我们所有的参与者每天都使用 Claude;未使用 Claude 的团队的每个成员都评论说,失去它感觉很奇怪。一些人特别指出,这次经历让他们觉得自己的编码技能不如以前那么敏锐了。请记住,[Claude Code](https://claude.com/product/claude-code) 在这个实验之前仅仅推出了六个月。与未使用 Claude 的团队交谈强调了我们快速接受最近还很了不起的东西作为正常的能力。

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/90c89bf556a73086b0a8f6ecccd3d8e589b1e0c2-4096x2305.png)

图 4:两个团队之间提出的问题和表达困惑的差异。(绝对差异和相对差异之间的差异是由于四舍五入。)

这些团队似乎有不同的工作风格。在最初的咨询之后,使用 Claude 的团队的每个成员似乎主要与他们自己的 AI 助手合作,因为他们朝着每个目标追求平行路径。未使用 Claude 的团队似乎进行了更深入的战略规划,并更频繁地相互咨询。同样,文本分析支持了我们的观察:未使用 Claude 的团队比使用 Claude 的团队多提出了 44% 的问题(见图 4)。

一种解释是,未使用 Claude 的团队成员更加投入并相互联系。这与我们即将从 Anthropic 员工访谈中获得的一些发现产生共鸣。

尽管如此,这本可能是其他情况。实际上,四人使用 Claude 的团队是一个八个 Agent 的团队,每个人都使用自己的 AI 模型实例。然而,如果 Claude 更了解任务的性质,它可能能够帮助战略性地分工并在需要时促进沟通。目前,Claude 面向与单个人的合作,而不是对团队的支持或编排,但这最终是一个可塑的设计选择。

## [花絮](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E8%8A%B1%E7%B5%AE)

这一天不仅仅是用秒表计时子任务和准备分析转录。它也很有趣。

机器狗配备了一些我们的参与者设法解锁的预编程行为。在当天的不同时刻,有机器人在跳舞、用后腿站立和做后空翻(这让许多参与者震惊地跳了起来)。特别是未使用 Claude 的团队,在他们最终建立了工作连接后,对机器狗的杂技表演感到一些喜悦。

使用 Claude 的团队的支线任务之一是努力编写一个替代控制器。主要解决方案使用笔记本电脑键盘上的按钮来指挥机器狗。然而,使用 Claude 的团队的一名成员最终让一个自然语言控制器工作了,使他们能够直接告诉机器狗向前走、向后走,甚至做俯卧撑。

随着任务变得更加困难,出现了 AI 系统将不得不在现实世界中平滑的粗糙边缘的证据。例如,使用 Claude 的团队被(任意)分配了绿色作为他们的机器狗和沙滩球颜色的装饰。当涉及到开发检测球的方法时,使用 Claude 的团队训练了一个算法来专门识别绿色球。这在测试中效果很好,但当球被放在上述假(绿色)草上时,机器人最初感到困惑。在这种情况下,是人类在指定目标的层次上做出了潜在的次优选择。但这些正是类似情况的 AI 将面临的挑战。

## [局限性](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E5%B1%80%E9%99%90%E6%80%A7)

我们从 Project Fetch 中学到了很多,但这项研究显然有缺点和局限性。这只是两个团队的一个实验——样本量显然很小。我们只在一天的过程中测试了任务,而这些任务在学术上很有趣,但在实践上微不足道。

我们使用志愿的 Anthropic 员工相当于一个便利样本。对 AI 不太熟悉的参与者可能会在启用 Claude 的组和未启用 Claude 的组之间表现出更窄的差异。可以使用 AI 的 AI 新手需要更多时间来适应技术,而没有帮助的 AI 新手不会像我们的研究人员那样迷失方向,他们突然失去了 Claude。

最后,这不是对 Claude 端到端进行机器人工作能力的测试,尽管这是未来类似评估的重要初步步骤。

## [反思](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E5%8F%8D%E6%80%9D)

那么,在 Project Fetch 结束时,我们认为我们在哪里?我们可能会去哪里?

首先,这个实验展示了 Claude 如何在潜在有价值的领域提升人类能力的另一个例子。非专家在有限的时间内执行了困难的机器人任务。

但在 AI 中,提升通常先于自主。今天模型可以帮助人类完成的事情,明天它们通常可以独自完成。程序员不再只是给 AI 提供代码片段进行调试;他们给 AI 任务,让模型自己编写代码。鉴于这样的研究,我们认为前沿 AI 模型能够成功与以前未知的硬件交互的世界即将到来。

重要的是要结合我们的另一条研究线来继续追踪这些能力:监控 AI 自动化和加速未来几代 AI 开发的潜力。这是 Anthropic [负责任扩展政策](https://www-cdn.anthropic.com/872c653b2d0501d6ab44cf87f43e1dc4853e4d37.pdf)中包含的能力阈值之一,因为真正_自主_ AI 研发的潜力可能产生快速、不可预测的进步,这可能超过我们评估和解决新兴风险的能力。我们的模型还没有达到这一点。但如果它们接近这个阈值,Project Fetch 的结果表明,我们将需要监控 AI 模型在机器人和其他硬件方面的能力,作为可能出现突然改进的领域。

仍然存在很大的不确定性。时间表不清楚——模型改进以及在物理世界中迭代产生瓶颈的程度。控制_现有_硬件是一回事,设计、构建和改进_新_硬件是另一回事。

但是,强大、智能和自主的 AI 系统使用它们的一些智能和力量通过机器人在世界上行动的想法并不像听起来那么离谱。

这些狗现在在它们的狗舍里。但我们很快会再次放它们出来,并让你了解我们发现的情况。

#### [脚注](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E8%84%9A%E6%B3%A8)

## [相关内容](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E7%9B%B8%E5%85%B3%E5%86%85%E5%AE%B9)

### [AI 如何改变 Anthropic 的工作方式](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#ai-%E5%A6%82%E4%BD%95%E6%94%B9%E5%8F%98-anthropic-%E7%9A%84%E5%B7%A5%E4%BD%9C%E6%96%B9%E5%BC%8F)

[阅读更多](https://stellarlink.co/research/how-ai-is-transforming-work-at-anthropic)

### [从 Claude 对话估算 AI 生产力提升](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E4%BB%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87)

[阅读更多](https://stellarlink.co/research/estimating-productivity-gains)

### [减轻浏览器使用中 Prompt 注入的风险](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#%E5%87%8F%E8%BD%BB%E6%B5%8F%E8%A7%88%E5%99%A8%E4%BD%BF%E7%94%A8%E4%B8%AD-prompt-%E6%B3%A8%E5%85%A5%E7%9A%84%E9%A3%8E%E9%99%A9)

[阅读更多](https://stellarlink.co/research/prompt-injection-defenses)

## [Footnotes](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#footnote-label)

1.  几位参与者在高中参加过乐高机器人比赛。我们愿意接受这可能混淆结果的最小程度。 [↩](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fnref-1)
    
2.  见 [Claude 4 System Card](https://www-cdn.anthropic.com/6d8a8055020700718b0c49369f60816ba2a7c285.pdf) 第 114 页。 [↩](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fnref-2)
    
3.  尽管使用 Claude 的团队在第一阶段确实更快,但他们没有使用 Claude,我们也不认为这反映了潜在的技能优势。相反,他们碰巧得到了机器人附带的一个独立控制器,而未使用 Claude 的团队必须在手机上下载一个应用程序。 [↩](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fnref-3)
    
4.  见 Pennebaker, J. W., & Francis, M. E. (1996). [Cognitive, emotional, and language processes in disclosure](https://psycnet.apa.org/record/1996-06871-002). _Cognition & Emotion_, 10(6), 601-626 和 Tausczik, Y. R., & Pennebaker, J. W. (2010). [The psychological meaning of words: LIWC and computerized text analysis methods](https://psycnet.apa.org/record/2010-04445-003). _Journal of Language and Social Psychology_, 29(1), 24-54. [↩](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fnref-4)
    
5.  未使用 Claude 的团队表现出更多负面情绪(_p_ = 0.0017),效应大小很大(_d_ = 2.16)。净情绪表达的差异在统计上不显著(_p_ = 0.2703)。团队之间负面情绪和净情绪表达的统计比较使用非参数 Mann-Whitney _U_ 检验进行,该检验测试两个独立组之间分布的差异,而不假设正态性。_p_ 值是使用基于秩和统计及其渐近正态近似的双侧替代假设计算的。效应大小使用 Cohen’s _d_ 量化,计算为组均值差除以合并标准差。 [↩](https://stellarlink.co/articles/project-fetch-%E6%9C%BA%E5%99%A8%E7%8B%97%E5%AE%9E%E9%AA%8C#user-content-fnref-5)
