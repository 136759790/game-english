import { _decorator, Component, Node, Label, Sprite, Widget, Button, Color, Vec3, tween, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HomeScreen')
export class HomeScreen extends Component {
    @property(Label)
    titleText: Label = null;

    @property(Label)
    subtitleText: Label = null;

    @property(Label)
    welcomeText: Label = null;

    @property(Label)
    progressText: Label = null;

    @property(Label)
    bookNameText: Label = null;

    @property(Button)
    switchButton: Button = null;

    @property(Button)
    startButton: Button = null;

    @property(Node)
    homePanel: Node = null;

    private _userName: string = '微信用户';
    private _currentLevel: number = 1;
    private _totalLevels: number = 20;
    private _currentBook: string = '一年级上';

    onLoad() {
        this.bindEvents();
        this.updateUI();
    }

    private bindEvents() {
        if (this.switchButton) {
            this.switchButton.node.on(Button.EventType.CLICK, this.onSwitchBook, this);
        }
        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this.onStartGame, this);
        }
    }

    private updateUI() {
        if (this.welcomeText) {
            this.welcomeText.string = `👋 欢迎你，${this._userName}`;
        }
        if (this.progressText) {
            this.progressText.string = `🏆 当前进度：第 ${this._currentLevel} / ${this._totalLevels} 关`;
        }
        if (this.bookNameText) {
            this.bookNameText.string = `📚 当前词库：${this._currentBook}`;
        }
    }

    public setUserInfo(name: string) {
        this._userName = name;
        this.updateUI();
    }

    public setProgress(current: number, total: number) {
        this._currentLevel = current;
        this._totalLevels = total;
        this.updateUI();
    }

    public setCurrentBook(bookName: string) {
        this._currentBook = bookName;
        this.updateUI();
    }

    private onSwitchBook() {
        console.log('切换词库');
        // TODO: 打开词库选择界面
    }

    private onStartGame() {
        console.log('开始游戏');
        // TODO: 进入游戏场景
    }

    start() {
        // 入场动画
        this.playEnterAnimation();
    }

    private playEnterAnimation() {
        if (this.homePanel) {
            this.homePanel.setPosition(0, -100, 0);
            this.homePanel.opacity = 0;

            tween(this.homePanel)
                .to(0.5, { position: new Vec3(0, 0, 0), opacity: 255 }, { easing: 'backOut' })
                .start();
        }
    }
}