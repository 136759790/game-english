# Cocos Creator 首页 Card 节点结构

## 节点层级树

```
Canvas (Canvas)
└── HomePanel (Node)
    ├── Background (Sprite)              -- 半透明白底 + 绿色描边
    ├── TitleGroup (Node)
    │   ├── TitleText (Label)            -- "单词牵线"
    │   ├── SubtitleText (Label)         -- "WORD LINK CHALLENGE"
    │   └── WelcomeText (Label)          -- "👋 欢迎你，xxx"
    ├── InfoBox (Node)
    │   ├── Background (Sprite)          -- 浅绿底卡片
    │   └── ProgressText (Label)         -- "🏆 当前进度..."
    ├── SwitchBox (Node)                 -- 可点击，加 Button 组件
    │   ├── Background (Sprite)
    │   ├── BookNameText (Label)         -- "📚 当前词库：xxx"
    │   └── SwitchText (Label)           -- "切换 ➔"
    ├── TipBox (Node)
    │   ├── Background (Sprite)
    │   ├── TipText1 (Label)             -- "⏱️ 挑战机制..."
    │   └── TipText2 (Label)             -- "⚡ 每次成功配对..."
    └── StartButton (Node)               -- 加 Button 组件
        ├── Background (Sprite)          -- 渐变绿色
        └── ButtonText (Label)           -- "开 始 游 戏"
```

## 各节点详细配置

### 1. HomePanel (主面板)
- **组件**: Widget, Sprite
- **Widget**: 水平居中，顶部距离 22% 或 115px
- **尺寸**: 宽 340，高 440
- **Sprite**: 使用 9-Slice 圆角矩形图片，或 Graphics 绘制

### 2. TitleText (标题)
- **组件**: Label
- **字体大小**: 34
- **颜色**: #2e7d32
- **对齐**: 水平居中
- **粗体**: 是

### 3. SubtitleText (副标题)
- **组件**: Label
- **字体大小**: 11
- **颜色**: #558b2f
- **对齐**: 水平居中
- **粗体**: 否

### 4. WelcomeText (欢迎语)
- **组件**: Label
- **字体大小**: 15
- **颜色**: #33691e
- **对齐**: 水平居中

### 5. InfoBox (进度卡片)
- **尺寸**: 宽 = 面板宽 - 40，高 46
- **圆角**: 14
- **背景色**: #f1f8e9
- **描边色**: #c5e1a5，线宽 1.5

### 6. ProgressText (进度文字)
- **组件**: Label
- **字体大小**: 14
- **颜色**: #2e7d32
- **粗体**: 是

### 7. SwitchBox (词库切换)
- **尺寸**: 宽同 InfoBox，高 42
- **圆角**: 14
- **背景色**: #f9fbe7
- **描边色**: #dce775，线宽 1.5
- **添加 Button 组件** 用于点击交互

### 8. BookNameText (词库名称)
- **组件**: Label
- **字体大小**: 13
- **颜色**: #33691e
- **对齐**: 左对齐，左边距 16
- **粗体**: 是

### 9. SwitchText (切换文字)
- **组件**: Label
- **字体大小**: 13
- **颜色**: #558b2f
- **对齐**: 右对齐，右边距 16

### 10. TipBox (提示框)
- **尺寸**: 宽同 InfoBox，高 46
- **圆角**: 12
- **背景色**: #f1f8e9
- **描边色**: #c5e1a5，线宽 1.2

### 11. TipText1 / TipText2 (提示文字)
- **TipText1**: 11px，#33691e，粗体
- **TipText2**: 10px，#558b2f，常规

### 12. StartButton (开始按钮)
- **尺寸**: 宽 = 面板宽 - 48，高 52
- **圆角**: 26
- **渐变**: #81c784 → #43a047
- **阴影**: rgba(67, 160, 71, 0.35)，模糊 10，Y 偏移 4
- **描边**: #2e7d32，线宽 2
- **添加 Button 组件**

### 13. ButtonText (按钮文字)
- **组件**: Label
- **字体大小**: 20
- **颜色**: #ffffff
- **粗体**: 是