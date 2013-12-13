////////////////////////////////////開発途中////////////////////////////////////
(function(){

 var cv = {};
 
//------------------メソッド------------------------

cv.cvKMeans2 = function (samples, cluster_count, labels, termcrit){
	try{
		if(cv.cvUndefinedOrNull(samples) || cv.cvUndefinedOrNull(cluster_count) || cv.cvUndefinedOrNull(labels)
			|| cv.cvUndefinedOrNull(termcrit))
			throw "samples or cluster_count or labels or termcrit " + ERROR.IS_UNDEFINED_OR_NULL;
			
			function clustering(samples, clusters, labels)
			{
				for(var i = 0 ; i < samples.height ; i++){
					for(var j = 0 ; j < samples.width; j++){
						var ji = (j + i * samples.width) * CHANNELS;
						var c1 = samples.RGBA[ji];
						var c2 = samples.RGBA[1 + ji];
						var c3 = samples.RGBA[2 + ji];
						
						var disC1 = c1 - clusters.RGBA[0];
						var disC2 = c2 - clusters.RGBA[1];
						var disC3 = c3 - clusters.RGBA[2];
						
						var dis = disC1 * disC1 + disC2 * disC2 + disC3 * disC3;
						
						for(var cnum = 1 ; cnum < clusters.width; cnum++){
								
						}
					}
				}
			}
	}
	catch(ex){
		alert("cv.cvKMeans2 : " + ex);
	}
}

cv.cvInPaint = function (src, mask, dst, inpaintRadius, flags){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(mask) || cv.cvUndefinedOrNull(dst)
			|| cv.cvUndefinedOrNull(inpaintRadius))
			throw "src or mask or dst or inpaintRadius " + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst.width || src.height != dst.height ||
			mask.width != dst.width || mask.height != dst.height)
				throw "src or mask or dst " + ERROR.DIFFERENT_SIZE;
		
		if(flags != cv.cv_INPAINT.TELEA)
			throw "flagsは現在cv.cv_INPAINT.TELENAしかサポートしていません";

		function cvInPaintOneLoop(src, mask, dst, inpaintRadius, flags){
			
			// -- maskのエッジ探索 --
			var edge = new cv.cvCreateImage(src.width, src.height);
			cv.cvZero(edge);
			for(var i = 0 ; i < edge.height ; i++){
				if(i != 0 && i != edge.height - 1){
					for(var j = 0 ; j < edge.width ; j++){
						var v = 0;
						if(j != 0 && j != edge.width - 1){
							//8近傍チェック
							for(var y = -1 ; y <= 1 ; y++){
								for(var x = -1 ; x <= 1 ; x++){
									if(mask.RGBA[(j + x + (i + y) * mask.width) * CHANNELS] == 0){
										v = 255;
										break;
									}
								}
								if(v != 0) break;
							}
						}
						edge.RGBA[(j + i * edge.width) * CHANNELS] = v;
					}
				}
				else{
					for(var j = 0 ; j < edge.width ; j++){
						edge.RGBA[(j + i * edge.width) * CHANNELS] = 255;
					}
				}
			}
			
			// -- 輝度勾配 --
			gImage = cv.cvCreateImage(src.width, src.height);
			cv.cvZero(gImage);
			for(var i = 0 ; i < gImage.height ; i++){
				for(var j = 0 ; j < gImage.width ; j++){
					if(edge.RGBA[(j + i * edge.width) * CHANNNELS] != 0){
						for(var c = 0 ; c < 3 ; c++){
							var dx = src.RGBA[(j + 1 + i * src.width) * CHANNNELS] - src.RGBA[(j - 1 + i * src.width) * CHANNNELS];
							var dx = src.RGBA[(j + (i + 1) * src.width) * CHANNNELS] - src.RGBA[(j + (i - 1) * src.width) * CHANNNELS];
						}
					}
				}
			}
				
			switch(flags){
			case cv.cv_INPAINT.NS:
			break;
			default:
			break;
			}
		}
	}
	catch(ex){
		alert("cv.cvInPaint : " + ex);
	}
}

//ハフ変換
//入力
//src IplImage型 GRAY表色系を想定(RGB表色系ならRで実行される)
//method cv.cv_HOUGH型 ハフ変換の種類
//rho 少数 距離解像度 1ピクセルあたりの単位 
//theta 少数 角度解像度 ラジアン単位
//threshold 整数 対応する投票数がこの値より大きい場合のみ抽出された直線が返される
//param1 少数 各手法に応じたパラメータ 解説参照
//param2 少数 各手法に応じたパラメータ 解説参照
//出力
//[ラインの数][ラインの情報]の二次元配列が返る
//[X][0]にrhoの値
//[X][1]にthetaの値
//解説
//cv.cv_HOUGH.STANDARDの場合
//  param1,param2共に使用しない(0)
//cv.cv_HOUGH.PROBABILISTICの場合
//  param1は最小の線の長さ使用しない(0)
//  param2は同一線として扱う線分の最大間隔
//cv.cv_HOUGH.MULTI_SCALEの場合
//  param1はrhoの序数（荒い距離はrho,詳細な距離ではrho/param1）
//  param2はthetaの序数 （荒い角度はtheta,詳細な角度ではtheta/param2）
//http://codezine.jp/article/detail/153
cv.cvHoughLines2 = function (src, method, rho, theta, threshold, param1, param2){
	var rtn = null;
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(method) ||
			cv.cvUndefinedOrNull(rho) || cv.cvUndefinedOrNull(theta) || cv.cvUndefinedOrNull(threshold))
			throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		
		if(method != cv.cv_HOUGH.STANDARD)
			throw "methodは現在cv.cv_HOUGH.STANDARDしかサポートしていません";
		
		if(cv.cvUndefinedOrNull(param1)) param1 = 0;
		if(cv.cvUndefinedOrNull(param2)) param2 = 0;
		
		//---------------------------------------
		//-- 初期化 --
		//---------------------------------------
		var rtn = new Array();
		var thetaMax = Math.floor(Math.PI/theta);
		var sn = new Array(thetaMax); //サインカーブ配列
		var cs = new Array(thetaMax);//コサインカーブ配列
		var diagonal = new Array(src.height);//半径計算用斜線長テーブル
		
      	var counter = new Array(thetaMax);//直線検出用頻度カウンタ
      	var rhoMax = Math.floor(Math.sqrt(src.width * src.width + src.height * src.height) + 0.5);
      	for(var i = 0 ; i < counter.length ; i++){
      		counter[i] = new Array(2 * rhoMax);
      		for(var j = 0 ; j < counter[i].length ; j++){
      			counter[i][j] = 0;
      		}
      	}

		//三角関数テーブルを作成
		for(var i = 0 ; i < sn.length ; i++){
			sn[i] = Math.sin(i * theta);
			cs[i] = Math.cos(i * theta);
		}
		
		
		switch(method){
		
		case cv.cv_HOUGH.STANDARD:
		
		for(var i = 0 ; i < src.height ; i++){
			var is = i * src.width * CHANNELS;
			var js = 0;
			for(var j = 0 ; j < src.width ; j++){
				if(src.RGBA[js + is] == 255){
					for(var t = 0 ; t < thetaMax; t++){
						r = Math.floor(j * cs[t] + i * sn[t] + 0.5);
						counter[t][r + rhoMax]++;
					}
				}
				js += CHANNELS;
			}
		}

		break;
		
		case cv.cv_HOUGH.PROBABILISTIC:
		break;
		case cv.cv_HOUGH.MULTI_SCALE:
		break;
		}
		
		var num = 0;
		for(var t = 0 ; t < counter.length ; t++){
			for(var r = 0 ; r < counter[t].length ; r++){
				if(counter[t][r] > threshold){
					rtn[num] = new Array(2);
					rtn[num][0] = r - rhoMax;
					rtn[num][1] = t;
					num++;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvHoughLines2 : " + ex);
	}
	
	return rtn;
}


//////////////////////////////////////////////////////////////////////////////




//メモ
//imgタグの画像から直接IplImage型へは変換できない
//ローカルの画像ファイルはクロスドメイン扱いとなりjavascriptのエラーが出る
//
//------------------データ型------------------------
//canvasのRGBA値は0縲鰀255の値しかもてないため専用の画像データ型を用意
cv.cv.IplImage = function(){
	width: 0;
	height: 0;
	canvas: null;
	imageData: null;
	RGBA: null;
}

cv.cvMat = function(){
	rows: 0;
	cols: 0;
	vals: null;
}
cv.cvHistogram = function(){
	type: 0;
	bins: null;
	thres: null;
	thres2: null;
	mat: null;
	ranges: null;
}

cv.cvScalar = function(){
	this.val = new Array(0, 0, 0, 255);
}

cv.cvPoint = function(){
	x: 0;
	y: 0;
}

cv.cvSize = function(){
	width: 0;
	height: 0;
}


//反復アルゴリズムの終了条件
cv.cvTermCriteria = function(){
	type: 0; //cv.cv_TERMCRIT定数の組み合わせ
	max_iter: 0; //反復数の最大値
	epsilon: 0; //目標精度
}

//------------------定数------------------------

//反復アルゴリズムのための終了条件
//cv.cvTermCriteria型の変数に利用する
cv.cv_TERMCRIT = {
	ITER: 0,
	NUMBER: 0,
	EPS: 2
}
//ハフ変換の種類
cv.cv_HOUGH = {
	STANDARD : 0,
	PROBABILISTIC : 1,
	MULTI_SCALE : 2
}

//逆行列の演算の種類
cv.cv_INV = {
	LU: 0,
	SVD: 1,
	SVD_SYM: 2
}

//ヒストグラムの種類
cv.cv_HIST = {
	ARRAY: 0,
	SPARSE: 1
}

//表色系変換の種類
cv.cv_CODE = {
	RGB2GRAY: 0,
	RGB2HSV: 1,
	HSV2RGB: 2,
	RGB2HLS: 3,
	HLS2RGB: 4,
	RGB2YCbCr: 5,
	YCbCr2RGB: 6
}

//ブレンドの種類
cv.cv_BLEND_MODE = {
	OVER_LAY: 0, //オーバーレイ
	SCREEN: 1, //スクリーン
	HARD_LIGHT: 2, // ハードライト
	SOFT_LIGHT: 3, // ソフトライト
	VIVID_LIGHT: 4, //ビビットライト
	LINEAR_LIGHT: 5, //リニアライト
	PIN_LIGHT: 6, //ピンライト
	COLOR_DODGE: 7, //覆い焼きカラー
	LINEAR_DODGE: 8, //覆い焼き（リニア）
	COLOR_BURN: 9, //焼きこみカラー
	LINEAR_BURN: 10, //焼きこみ（リニア）
	EXCLUSION: 11, //除外
	MUL: 12 //掛け算
}

//スムージングの種類
cv.cv_SMOOTH_TYPE = {
	BLUR_NO_SCALE: 0,
	BLUR: 1,
	GAUSSIAN: 2,
	MEDIAN: 3,
	BILATERAL: 4
}

//閾値処理の種類
cv.cv_THRESHOLD_TYPE = {
	THRESH_BINARY: 0,
	THRESH_BINARY_INV: 1,
	THRESH_TRUNC: 2,
	THRESH_TOZERO: 3,
	THRESH_TOZERO_INV: 4, 
	THRESH_OTSU: 5
}

//モルフォロジー変換の種類
cv.cv_MOP = {
	OPEN : 0,
	CLOSE : 1,
	GRADIENT : 2,
	TOPHAT : 3,
	BLACKHAT : 4
}

//DFTの種類
cv.cv_DXT = {
	FORWARD: 0, //順変換 スケーリングなし
	INVERSE: 1, //逆変換 スケーリングなし
	FORWARD_SCALE: 2, //順変換 スケーリングあり
	INVERSE_SCALE: 3, //逆変換 スケーリングあり
}


//四則演算の種類
cv.cv.FOUR_ARITHMETIC = {
	ADD : 0,
	SUB : 1,
	MULT : 2,
	DIV : 3
}

//リサイズの種類
cv.cv_INTER = {
	NN : 0,
	LINEAR : 1,
	AREA : 2,
	CUBIC : 3
}

//インペイントの種類
cv.cv_INPAINT = {
	NS: 0,
	TELEA: 1
}

//反復アルゴリズムのための終了条件
//cv.cvTermCriteria型の変数に利用する
cv.cv_TERMCRIT = {
	ITER: 1,
	EPS: 2
}

//チャンネル数
cv.cv.CHANNELS = 4;

//エラー文
cv.cv.ERROR = {
	IS_UNDEFINED_OR_NULL : "がundefinedかnullです",
	DIFFERENT_SIZE : "IplImageサイズは全て同じにして下さい",
	DIFFERENT_ROWS_OR_COLS: "行と列が正しくありません",
	DIFFERENT_LENGTH: "の長さは全て同じにして下さい",
	ONLY_ADD_NUMBER : "は奇数にして下さい",
	ONLY_INTERGER_NUMBER : "は整数にして下さい",
	ONLY_POSITIVE_NUMBER : "は正の値にして下さい",
	NOT_READ_FILE : "ファイルが読み込めません",
	NOT_GET_CONTEXT : "contextが読み込めません",
	PLEASE_SQUARE_MAT : "は正方行列にしてください",
	SWITCH_VALUE : "の値が正しくありません",
	APERTURE_SIZE : "aperture_sizeは1, 3, 5または7 のいずれかにしてください",
	ONLY_NUMBER : "は0から3にして下さい"
}


//画像読み込み時に利用される変数
//任意のダミー画像のパスを指定
//1*1の画像を推奨
var DMY_IMG="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEHAAEALAAAAAABAAEAAAICTAEAOw==";


//------------------メソッド------------------------

//2次元ベクトルの角度と大きさを求めます
//入力
// xImage IplImage型 x座標の値(x方向の微分画像)
// yImage IplImage型 y座標の値(y方向の微分画像)
// magImage IplImage型 大きさの出力 xImageと同じサイズ
//angImage IplImage型 角度の出力 xImageと同じサイズ角度はラジアン (-PI から PI) あるいは度 (-180 から 180) で表される
//angleInDegrees bool型 角度の表記にラジアン（デフォルト），または度のどちらを用いるかを指定するフラグ trueでラジアン
//出力
//なし
cv.cvCartToPolar=function (xImage, yImage, magImage, angImage, angleInDegrees){
	try{
		if(cv.cvUndefinedOrNull(xImage) || cv.cvUndefinedOrNull(yImage) ||
			cv.cvUndefinedOrNull(magImage) || cv.cvUndefinedOrNull(angImage))
			throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		else if(xImage.width != yImage.width || yImage.width != magImage.width ||  magImage.width != angImage.width ||
			xImage.height != yImage.height || yImage.height != magImage.height ||  magImage.height != angImage.height)
			throw ERROR.DIFFERENT_SIZE;
			
		if(cv.cvUndefinedOrNull(angleInDegrees))
			angleInDegrees = false;

		for(var i = 0 ; i < xImage.height;  i++){
			var p = i * magImage.width * CHANNELS ;
			for(var j = 0 ; j < xImage.width; j++){
				var xI = xImage.RGBA[p];
				var yI = yImage.RGBA[p]
				magImage.RGBA[p] = Math.sqrt(xI * xI + yI * yI);
				angImage.RGBA[p] = Math.atan2(yI, xI);
				if(angleInDegrees) angImage.RGBA[p] *= 180 / Math.PI;
				p += CHANNELS ;
			}
		}
		
		
	}
	catch(ex){
		alert("cv.cvCartToPolar : " + ex);
	}
}


//rows行cols列の行列を作る
//C言語でいう a[rows][cols]
//入力
//rows 整数 (y座標)
//cols 整数 (x座標)
//出力
//cv.cvMat型
cv.cvCreateMat = function (rows, cols){
	var rtn = null;
	try{
		if(cv.cvUndefinedOrNull(rows) || cv.cvUndefinedOrNull(cols))
			throw "rows or cols" + ERROR.IS_UNDEFINED_OR_NULL;
//		if(!cv.cvIsInt(rows) || !cv.cvIsInt(cols) || rows < 1 || cols < 1)
//			throw "rows or cols" + ERROR.ONLY_NORMAL_NUMBER;
		
		rtn = new cv.cvMat();
		rtn.rows = rows;
		rtn.cols = cols;
		rtn.vals = new Array(rows * cols);
	}
	catch(ex){
		alert("cv.cvCreateMat : " + ex);
	}
	
	return rtn;
}

//行列に値を代入
//入力
//mat cv.cvMat型 代入される行列
//row 整数 代入する行番号(y座標)
//col 整数 代入する列番号(x座標)
//val 数値 代入される値
//出力
//なし
cv.cvmSet = function (mat, row, col, value){
	try{
		if(cv.cvUndefinedOrNull(mat) || cv.cvUndefinedOrNull(value)|| 
			cv.cvUndefinedOrNull(row) || cv.cvUndefinedOrNull(col))
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
//		if(!cv.cvIsInt(rows) || !cv.cvIsInt(cols))
//				throw "rows or cols" + ERROR.ONLY_INTERGER_NUMBER;
		
		mat.vals[col + row * mat.cols] = value;
	}
	catch(ex){
		alert("cv.cvmSet : " + ex);
	}
}

//行列から値を取得
//入力
//mat cv.cvMat型 取得される行列
//row 整数 取得する行番号(y座標)
//col 整数 取得する列番号(x座標)
//出力
//数値
cv.cvmGet = function (mat, row, col){
	var rtn = null;
	try{
		if(cv.cvUndefinedOrNull(mat) || cv.cvUndefinedOrNull(row) || cv.cvUndefinedOrNull(col))
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
//		if(!cv.cvIsInt(rows) || !cv.cvIsInt(cols))
//				throw "rows or cols" + ERROR.ONLY_INTERGER_NUMBER;
		
		rtn = mat.vals[col + row * mat.cols];
	}
	catch(ex){
		alert("cv.cvmGet : " + ex);
	}
	return rtn;
}

//行列の足し算
//入力
//matA cv.cvMat型 足す行列
//matB cv.cvMat型 足される行列
//matX cv.cvMat型 結果が代入される行列
//出力
//なし
cv.cvmAdd = function (matA, matB, matX){
	try{
		if(cv.cvUndefinedOrNull(matA) || cv.cvUndefinedOrNull(matB)|| cv.cvUndefinedOrNull(matX))
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(matA.rows != matB.rows || matA.cols != matB.cols ||
			matB.rows != matX.rows || matB.cols != matX.cols)
				throw "引数の" + ERROR.DIFFERENT_SIZE;
		
		for(var i = 0 ; i < matX.rows ; i++){
			var im = i * matX.cols;
			for(var j = 0 ; j < matX.cols ; j++){
				var ji = j + im;
				matX.vals[ji] = matA.vals[ji] + matB.vals[ji];
			}
		}
	}
	catch(ex){
		alert("cv.cvmAdd : " + ex);
	}
}

//行列の引き算
//入力
//matA cv.cvMat型 引く行列
//matB cv.cvMat型 引かれる行列
//matX cv.cvMat型 結果が代入される行列
//出力
//なし
cv.cvmSub = function (matA, matB, matX){
	try{
		if(cv.cvUndefinedOrNull(matA) || cv.cvUndefinedOrNull(matB)|| cv.cvUndefinedOrNull(matX))
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(matA.rows != matB.rows || matA.cols != matB.cols ||
			matB.rows != matX.rows || matB.cols != matX.cols)
				throw "引数の" + ERROR.DIFFERENT_SIZE;
		
		for(var i = 0 ; i < matX.rows ; i++){
			var im = i * matX.cols;
			for(var j = 0 ; j < matX.cols ; j++){
				var ji = j + im;
				matX.vals[ji] = matA.vals[ji] - matB.vals[ji];
			}
		}
	}
	catch(ex){
		alert("cv.cvmSub : " + ex);
	}
}

//行列の掛け算
//入力
//matA cv.cvMat型 掛ける行列
//matB cv.cvMat型 掛けられる行列
//matX cv.cvMat型 結果が代入される行列
//出力
//なし
cv.cvmMul = function cv.cvmMul(matA, matB, matX){
	try{
		if(cv.cvUndefinedOrNull(matA) || cv.cvUndefinedOrNull(matB)|| cv.cvUndefinedOrNull(matX))
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(matA.cols != matB.rows || matB.cols != matX.cols || matA.rows != matX.rows)
				throw "引数" + ERROR.DIFFERENT_ROWS_OR_COLS;
		
		for(var i = 0 ; i < matX.rows ; i++){
			var im = i * matX.cols;
			for(var j = 0 ; j < matX.cols ; j++){
				var v = 0;
				for(var l = 0 ; l < matA.cols ; l++) 
					v += matA.vals[l + im] * matB.vals[j + l * matB.cols];
				matX.vals[j + im] = v;
			}
		}
	}
	catch(ex){
		alert("cv.cvmMul : " + ex);
	}
}

//行列の転置
//入力
//matA cv.cvMat型 転置される行列
//matX cv.cvMat型 結果が代入される行列
//出力
//なし
cv.cvmTranspose = function cv.cvmTranspose(matA, matX){
	try{
		if(cv.cvUndefinedOrNull(matA) || cv.cvUndefinedOrNull(matX))
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(matA.rows != matX.cols || matA.cols != matX.rows)
				throw "引数の" + ERROR.DIFFERENT_ROWS_OR_COLS;
		
		for(var i = 0 ; i < matX.rows ; i++){
			var im = i * matX.cols;
			var jm = i;
			for(var j = 0 ; j < matX.cols ; j++){
				matX.vals[j + im] = matA.vals[jm];
				jm += matA.cols;
			}
		}
	}
	catch(ex){
		alert("cv.cvmTranspose : " + ex);
	}
}

//逆行列の演算
//入力
//mat cv.cvMat型 逆行列を求める行列
//invMat cv.cvMat型　求まった行列が代入される行列
//method cv.cv_INV配列 アルゴリズムの種類
//出力
//なし
cv.cvInverse = function cv.cvInverse(mat, invMat, method){
	try{
		if(cv.cvUndefinedOrNull(mat) || cv.cvUndefinedOrNull(invMat) ||
		mat.rows != invMat.rows || mat.cols != invMat.cols) 
				throw "mat または invMat" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(method)) method = cv.cv_INV.LU;
		if(method == cv.cv_INV.SVD_SYM)
			throw "cv.cv_INV.SVD_SYM は現在サポートされていません";
		
		switch(method){
		case cv.cv_INV.LU:
			if(mat.cols != mat.rows)
				throw "cv.cv_INV.LUの場合、mat" + PLEASE_SQUARE_MAT;

			//前進代入			
			function Lforwardsubs(L, b, y){
				for(var i = 0 ; i < L.rows ; i++)
					y.vals[i * y.cols] = b.vals[i * b.cols];
					
				for(var i = 0 ; i < L.rows ; i++){
					y.vals[i * y.cols] /= L.vals[i + i * L.cols];
					for(var j = i + 1 ; j < L.cols ; j++){
						y.vals[j * y.cols] -= y.vals[i * y.cols] * L.vals[ i + j * L.cols];
					}
				}
			}
			//後退代入
			function Ubackwardsubs(U, y, x){
				for(var i = 0 ; i < U.rows; i++)
					x.vals[i * x.cols] = y.vals[i * y.cols];
				
				for(var i = U.rows-1 ; i >= 0; i--){
					x.vals[i * x.cols] /= U.vals[i + i * U.cols];
					for(var j = i-1 ; j >= 0 ; j--){
						x.vals[j * x.cols] -= x.vals[i * x.cols] * U.vals[i + j * U.cols];
					}
				}
			}

			// -- matのLU分解 --
			var L = cv.cvCreateMat(mat.rows, mat.cols);
			var U = cv.cvCreateMat(mat.rows, mat.cols);	
			cv.cvLU(mat, L, U);
			
			for(var i = 0 ; i < mat.cols ; i++)
			{
				var initVec = cv.cvCreateMat(mat.rows, 1);
				for(var v = 0 ;  v < mat.rows ; v++)
					initVec.vals[v] = (v == i) ? 1 : 0 ;
				
				var dmyVec = cv.cvCreateMat(mat.rows, 1);
				var inverseVec = cv.cvCreateMat(mat.rows, 1);
				
				Lforwardsubs(L, initVec, dmyVec);
				Ubackwardsubs(U, dmyVec, inverseVec);
				
				for(var v = 0 ; v < mat.rows ; v++){
					invMat.vals[i + v * invMat.cols] = inverseVec.vals[v * inverseVec.cols];
				}
			}
			
		break;
		case cv.cv_INV.SVD:
			
		break;
		case cv.cv_INV.SVD_SYM: break;
		}
	}
	catch(ex){
		alert("cv.cvInverse : " + ex);
	}
}

//特異値分解の演算
cv.cvSVD = function (A, W, U, V, flags){
	try{
	}
	catch(ex){
		alert("cv.cvSVD : " + ex);
	}
}

//LU分解の演算
//入力
//mat cv.cvMat型 LU分解される行列
//L cv.cvMat型 Lの結果が代入される行列
//U cv.cvMat型 Uの結果が代入される行列
//出力
//なし
cv.cvLU = function (mat, L, U){
	try{
		if(cv.cvUndefinedOrNull(mat) || cv.cvUndefinedOrNull(L)  || cv.cvUndefinedOrNull(U) ) 
			throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(mat.rows != mat.cols || mat.rows == 0 || mat.cols == 0 ||
			L.rows != L.cols || L.rows == 0 || L.cols == 0 ||
			U.rows != U.cols || U.rows == 0 || U.cols == 0 ||
			mat.rows != L.rows || mat.rows != U.rows ||
			mat.cols != L.cols || mat.cols != U.cols)
			throw "全ての引数" + ERROR.PLEASE_SQUARE_MAT + " かつ 行列数は同じにして下さい";
		
		//初期化
		for(var i=0; i < mat.rows; i++){
			for(var j=0; j < mat.cols; j++){
				L.vals[j + i * L.cols] = 0;
				U.vals[j + i * U.cols] = 0;
				if(i==j) L.vals[j + i * L.cols]=1.0;
			}
		}
		
		var sum;
		for(var i=0; i < mat.rows; i++){
			for(var j=0; j < mat.cols; j++){
				if( i > j ){
					//-- L成分を求める --
					sum=0.0;
					for(var k=0; k < j; k++){
						sum+=L.vals[k + i * L.cols] * U.vals[j + k * U.cols];
					}
					L.vals[j + i * L.cols] = (mat.vals[j + i * mat.cols] - sum) / U.vals[j + j * U.cols];
				}else{
					// --U成分を求める--
					sum=0.0;
					for(var k=0;k<i;k++){
						sum+=L.vals[k + i * L.cols] * U.vals[j + k * U.cols];
					}
					U.vals[j + i * U.cols]=mat.vals[j + i * mat.cols] - sum;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvLU : " + ex);
	}
}

//行列式の演算
//入力
//mat cv.cvMat型　行列式を求める行列
//出力
//演算結果
cv.cvDet = function (mat){
	var rtn = null;
	try{
		if(cv.cvUndefinedOrNull(mat)) 
			throw "mat" + ERROR.IS_UNDEFINED_OR_NULL;
		if(mat.rows != mat.cols || mat.rows == 0 || mat.cols == 0)
			throw "mat" + ERROR.PLEASE_SQUARE_MAT;
		
		if(mat.cols == 1) rtn = cv.cvmGet(mat, 0, 0);
		if(mat.cols == 2){
			rtn = mat.vals[0] * mat.vals[1 + 1 * mat.cols];
			rtn -= mat.vals[1] * mat.vals[1 * mat.cols];
		}
		else if(mat.cols == 3){
			rtn = mat.vals[0] * mat.vals[1 + 1 * mat.cols] * mat.vals[2 + 2 * mat.cols];
			rtn += mat.vals[1 * mat.cols] * mat.vals[1 + 2 * mat.cols] * mat.vals[2];
			rtn += mat.vals[2 * mat.cols] * mat.vals[1] * mat.vals[2 + 1 * mat.cols];
			rtn -= mat.vals[2 * mat.cols] * mat.vals[1 + 1 * mat.cols] * mat.vals[2];
			rtn -= mat.vals[1 * mat.cols] * mat.vals[1] * mat.vals[2 + 2 * mat.cols];
			rtn -= mat.vals[0] * mat.vals[1 + 2 * mat.cols] * mat.vals[2 + 1 * mat.cols];
		}
		else{
			rtn = 1;
			var buf;
			//三角行列作成
			for(var i = 0 ; i < mat.rows ; i++){
				for(var j = 0; j < mat.cols ; j++){
					if(i < j){
						buf = mat.vals[ i + j * mat.cols ] / mat.vals[ i + i * mat.cols ];
						for(var k = 0 ; k < mat.cols ; k++)
							mat.vals[k + j * mat.cols] -= mat.vals[k + i * mat.cols] * buf;
					}
				}
			}
			//対角部分の積
			for(var i = 0 ; i < mat.rows ; i++){
				rtn *= mat.vals[i + i * mat.cols];
			}
		}		
	}
	catch(ex){
		alert("Det : " + ex);
	}
	
	return rtn;
}

//チャンネルを合成する
//入力
//src0 IplImage型 dstの0チャンネルに合成される
//src1 IplImage型 dstの1チャンネルに合成される
//src2 IplImage型 dstの2チャンネルに合成される
//src3 IplImage型 dstの3チャンネルに合成される
//dst IplImage型 合成した画像
//出力
//なし
//解説
//各srcの0チャンネルの値が合成される
cv.cvMerge = function (src0, src1, src2, src3, dst){
	try{
		if(cv.cvUndefinedOrNull(src0) || cv.cvUndefinedOrNull(src1) ||
			cv.cvUndefinedOrNull(src2) ||	cv.cvUndefinedOrNull(src3) || 	cv.cvUndefinedOrNull(dst) ) 
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(dst.width != src0.width || dst.width != src1.width || 
			dst.width != src2.width || dst.width != src3.width ||
			dst.height != src0.height || dst.height != src1.height ||
			dst.height != src2.height || dst.height != src3.height)
				throw "IplImageの大きさを統一してください";
				
		for(var c = 0 ; c < CHANNELS ; c++){
			var src;
			switch(c){
			case 0 : src = src0; break;
			case 1 : src = src1; break;
			case 2 : src = src2; break;
			case 3 : src = src3; break;
			}

			for(var i = 0 ; i < src.height ; i++){
				var is = i * src.width * CHANNELS;
				var js = 0;
				for(var j = 0 ; j < src.width ; j++){
					dst.RGBA[c + js + is] = src.RGBA[js + is];
					js += CHANNELS;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvMerge : " + ex);
	}
}

//チャンネルを分割する
//入力
//src IplImage型 原画像
//dst0 IplImage型 srcのチャンネル0が代入される
//dst1 IplImage型 srcのチャンネル1が代入される
//dst2 IplImage型 srcのチャンネル2が代入される
//dst3 IplImage型 srcのチャンネル3が代入される
//出力
//なし
//解説
//分割されたチャンネルは各dstの0～3チャンネル全てに代入される
cv.cvSplit = function (src, dst0, dst1, dst2, dst3){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst0) ||
			cv.cvUndefinedOrNull(dst1) ||	cv.cvUndefinedOrNull(dst2) || 	cv.cvUndefinedOrNull(dst3) ) 
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst0.width || src.width != dst1.width || 
			src.width != dst2.width || src.width != dst3.width ||
			src.height != dst0.height || src.height != dst1.height ||
			src.height != dst2.height || src.height != dst3.height)
				throw "IplImageの大きさを統一してください";

		for(var c = 0 ; c < CHANNELS ; c++){
			var dst;
			switch(c){
			case 0 : dst = dst0; break;
			case 1 : dst = dst1; break;
			case 2 : dst = dst2; break;
			case 3 : dst = dst3; break;
			}

			for(var i = 0 ; i < src.height ; i++){
				var is = i * src.width * CHANNELS;
				var js = 0;
				for(var j = 0 ; j < src.width ; j++){
					dst.RGBA[js + is] = src.RGBA[c + js + is];
					dst.RGBA[1 + js + is] = src.RGBA[c + js + is];
					dst.RGBA[2 + js + is] = src.RGBA[c + js + is];
					dst.RGBA[3 + js + is] = 255;
					js += CHANNELS;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvSplit : " + ex);
	}
}

//widthとheightを2のべき乗にする
//入力
//src IplImage型 原画像
//出力
//IplImage型 2のべき乗になった画像 値は鏡面置換
cv.cvPowerOfTwo = function (src){
	var dst = null;
	try{
		if(cv.cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;

		var newW = src.width;
		var newH = src.height;
		//横方向
		if ((src.width & (src.width - 1)) != 0){
			var newW = 1;
			while (newW < src.width) newW *= 2;
		}
		//縦方向
		if ((src.height & (src.height - 1)) != 0){
			newH = 1;
			while (newH < src.height) newH *= 2;
		}
		
		dst = cv.cvCreateImage(newW, newH);

		for(var c = 0 ; c < CHANNELS; c++){
			for(var i = 0 ; i < dst.height ; i++){
				var is =  i * dst.width * CHANNELS;
				var js = 0;
				var vi = i;
				if(vi > src.height - 1) vi = src.height - 2 - i % src.height;
				vi *= src.width;
				for(var j = 0 ; j < dst.width ; j++){	
					var vj = j;
					if(vj > src.width - 1) vj = src.width - 2 - j % src.width;
					dst.RGBA[c + js + is] = 
						src.RGBA[c + (vj + vi) * CHANNELS];
					js += CHANNELS;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvPowerOfTwo : " + ex);
	}
	
	return dst;
}

//画像をクロッピング
//入力
//src IplImage型 原画像
//xs 整数 クロッピングする左上x座標
//ys 整数 クロッピングする左上y座標
//width 整数 クロッピングする画像の横幅
//height 整数 クロッピングする画像の縦幅
//出力
//IplImage型 クロッピングされた画像
cv.cvCloping = function (src, xs, ys, width, height){
	var dst = null;
	try{
		if(cv.cvUndefinedOrNull(src) || 
			cv.cvUndefinedOrNull(xs) || cv.cvUndefinedOrNull(ys) ||
			cv.cvUndefinedOrNull(width) || cv.cvUndefinedOrNull(height))
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(xs + width > src.width || ys + height > src.height)
			throw "xs + width < src.width and ys + height < src.heightにしてください";
			
		dst = cv.cvCreateImage(width, height);
		for(var i = 0 ; i < dst.height ; i++){
			var is = i * dst.width * CHANNELS;
			var js = 0;
			for(var j = 0 ; j < dst.width ; j++){
				for(var c = 0 ; c < CHANNELS ; c++){
					dst.RGBA[c + js + is] = 
							src.RGBA[c + (j + xs + (i + ys) * src.width) * CHANNELS];
				}
				js += CHANNELS;
			}
		}
	}
	catch(ex){
		alert("cv.cvCloping : " + ex);
	}
	
	return dst;
}

//FFT or inverse FFT を行う
//入力
//src IplImage型 GRAY表色系を想定(RGB表色系ならRがFFTされる) ※解説参照
//isForward true/false trueなら順変換 falseなら逆変換
//出力
//なし
//解説
//srcのwidthとheight共に2のべき乗である必要がある
//計算結果は実数値が最初のチャンネル、虚数値がふたつめのチャンネルに代入される 
cv.cvFFT = function (src, isForward){
	try{
		if(cv.cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(isForward)) isForward = true;
		if((src.width & (src.width - 1)) != 0 ||
			(src.height & (src.height - 1)) != 0) throw "srcのwidthとheightは2のべき乗にしてください";

		//1次元変換
		function oneLineFFT(ar, ai, isForward){
			var j, j1, j2;
			var dr1, dr2, di1, di2, tr, ti;
			
			var iter = 0;
			j = ar.length;
			while((j /= 2) != 0) iter++;
			
			j = 1;
			for(var i = 0; i < iter; i++) j *= 2;

			var w = (isForward ? Math.PI: -Math.PI) / ar.length;
			var xp2 = ar.length;
			for(var it = 0; it < iter; it++)
			{
				xp = xp2;
				xp2 = Math.floor(xp2/2);
				w *= 2;
				for(var k = 0, i = - xp; k < xp2; i++)
				{
					var arg = w * k;
					k++;
					var wr = Math.cos(arg);
					var wi = Math.sin(arg);
					for(var j = xp; j <= ar.length; j += xp)
					{
						j1 = j + i;
						j2 = j1 + xp2;
						dr1 = ar[j1];
						dr2 = ar[j2];
						di1 = ai[j1];
						di2 = ai[j2];
						tr = dr1 - dr2;
						ti = di1 - di2;
						ar[j1] = dr1 + dr2;
						ai[j1] = di1 + di2;
						ar[j2] = tr * wr - ti * wi;
						ai[j2] = ti * wr + tr * wi;
					}
				}
			}
			j = j1 = ar.length / 2;
			j2 = ar.length - 1;
			for(var i = 1; i < j2; i++)
			{
				if(i < j)
				{
					w = ar[i];
					ar[i] = ar[j];
					ar[j] = w;
					w = ai[i];
					ai[i] = ai[j];
					ai[j] = w; 
				}
				k = j1;
				while(k <= j)
				{
					j -= k;
					k /= 2;
				}
				j += k;
			}
			if(!isForward) return;
			w = 1. / ar.length;
			for(var i = 0; i < ar.length; i++)
			{
				ar[i] *= w;
				ai[i] *= w;
			}
			return;
		}
		
		//横方向
		var ar = new Array(src.width);
		var ai = new Array(src.width);
		for(var i = 0 ; i < src.height ; i++){
			var is =  i * src.width * CHANNELS;
			var js = 0;
			for(var j = 0 ; j < src.width ; j++){
				ar[j] = src.RGBA[js + is];
				ai[j] = src.RGBA[1 + js + is];
				js += CHANNELS;
			}
			oneLineFFT(ar, ai, isForward);
			js = 0;
			for(var j = 0 ; j < src.width ; j++){
				src.RGBA[js + is] = ar[j] ;
				src.RGBA[1 + js + is] = ai[j] ;
				js += CHANNELS;
			}
		}
		
		//縦方向
		ar = new Array(src.height);
		ai = new Array(src.height);
		var schan = src.width * CHANNELS;
		for(var j = 0 ; j < src.width ; j++){
			var js = j * CHANNELS;
			var is = 0;
			for(var i = 0 ; i < src.height ; i++){
				ar[i] = src.RGBA[js + is];
				ai[i] = src.RGBA[1 + js + is];
				is += schan;
			}
			oneLineFFT(ar, ai, isForward);
			is = 0;
			for(var i = 0 ; i < src.height ; i++){
				src.RGBA[js + is] = ar[j] ;
				src.RGBA[1 + js + is] = ai[j] ;
				is += schan;
			}
		}
	}
	catch(ex){
		alert("cv.cvFFT : " + ex);
	}
}
//DFT
//入力
//src IplImage型 dftする画像 GRAY表色系を想定（RGB表色系ならRの数値だけで処理する）
//dst IplImage型 dftした結果が保存される RGB表色系ならRに実数 Gに虚数が代入される
//flags
//nonzero_rows
cv.cvDFT = function (src, dst, flags, nonzero_rows){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst) || cv.cvUndefinedOrNull(flags))
			throw "sizes or dst or flags" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(nonzero_rows)) nonzero_rows = 0;
		
		var arg = (cv.cv_DXT.FORWARD || cv.cv_DXT.FORWARD_SCALE) ? 
			-2 * Math.PI / src.width : 2 * Math.PI / src.width;
		
		cv.cvZero(dst);
		
		//横方向
		for(var y = 0 ; y < dst.height ; y++){
			console.log(y);
			for(var x = 0 ; x < dst.width ; x++){
				for(var i = 0; i < src.height ; i++){
					for(var j = 0 ; j < src.width ; j++){
						var freq = arg * x * j ;
						var cos = Math.cos(freq);
						var sin = Math.sin(freq);
						dst.RGBA[(x + y * dst.width) * CHANNELS] += 
							src.RGBA[(j + i * src.width) * CHANNELS] *  cos +
							src.RGBA[1 + (j + i * src.width) * CHANNELS] * sin;
							
						dst.RGBA[1 + (x + y * dst.width) * CHANNELS] += 
							src.RGBA[1 + (j + i * src.width) * CHANNELS] * cos -
							src.RGBA[(j + i * src.width) * CHANNELS] * sin;
					}
				}
			}
		}
		
		console.log("横終了");
		
		//縦方向
		for(var y = 0 ; y < dst.height ; y++){
			for(var x = 0 ; x < dst.width ; x++){
				for(var j = 0 ; j < src.width ; j++){
					for(var i = 0; i < src.height ; i++){				
						var freq = arg * y * i ;
						var cos = Math.cos(freq);
						var sin = Math.sin(freq);
						dst.RGBA[(x + y * dst.width) * CHANNELS] += 
							src.RGBA[(j + i * src.width) * CHANNELS] *  cos +
							src.RGBA[1 + (j + i * src.width) * CHANNELS] * sin;
							
						dst.RGBA[1 + (x + y * dst.width) * CHANNELS] += 
							src.RGBA[1 + (j + i * src.width) * CHANNELS] * cos -
							src.RGBA[(j + i * src.width) * CHANNELS] * sin;

					}
				}
			}
		}
		
		if(cv.cv_DXT.FORWARD_SCALE || INVERSE_SCALE){
			var scale = Math.sqrt(1.0 / (dst.width * dst.height));
			for(var i = 0 ; i < dst.height ; i++){
				for(var j = 0 ; j < dst.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] /= scale;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] /= scale;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvDFT : " + ex);
	}
}

//cv.cvHistogram型のインスタンスを返す
//入力
//dims 整数　ヒストグラムの次元数を表す
//sizes 整数の配列　要素数=dimsでなければならない　ヒストグラムのビン数
//type ヒストグラムの種類　cv.cv_HISTの値のどちらかを代入
//ranges 整数の２次元配列 ヒストグラムとしてカウントする値域 [[0, 256]]とすれば0~255の画素値をカウントする
//uniform 整数 一様性に関するフラグ．非0の場合，ヒストグラムは等間隔のビンを持つ  省略可
//出力
//cv.cvHistogramのインスタンス
//説明
//ヒストグラムのビン幅はsizesとrangesで決まる
cv.cvCreateHist = function (dims, sizes, type, ranges, uniform){
	var hist = new cv.cvHistogram();
	try{
		if(cv.cvUndefinedOrNull(sizes.length) || cv.cvUndefinedOrNull(ranges.length))
			throw "sizes or ranges" + ERROR.IS_UNDEFINED_OR_NULL;
		if(dims != sizes.length)
			throw "dims と sizes" + ERROR.DIFFERENT_LENGTH;
		if(cv.cvUndefinedOrNull(uniform)) uniform = 1;
		if(type != cv.cv_HIST.ARRAY) throw "type は現在cv.cv_HIST.ARRAYしかサポートされていません";
		if(dims != 1) throw "dims は現在1しかサポートされていません";
		if(uniform == 0) throw "uniform は現在0はサポートされていません";
		
		switch(type){
		case cv.cv_HIST.ARRAY:
			hist.ranges = ranges;
			hist.type = type;
			hist.bins = new Array(new Array(sizes[0]));
			for(var i = 0 ; i < hist.bins[0].length ; hist.bins[0][i++] = 0);
			hist.thres = null;
			hist.thres2 = null;
			hist.mat = null;
		break;
		case cv.cv_HIST.SPARSE:
		break;
		default:
			throw "type " + ERROR.SWITCH_VALUE;
		break;
		}
	}
	catch(ex){
		alert("cv.cvCreateHist : " + ex);
	}
	
	return hist;
}

//ヒストグラムを計算する
//入力
//src IplImage型 ヒストグラムを調べる対象
//hist cv.cvHistogram型 結果が代入される
//accumulate 整数 計算フラグで0でないならヒストグラムの値が追加されていく 0でビンが0になる
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし 第２引数のhistに結果が代入される 
cv.cvCalcHist = function (src, hist, accumulate, mask){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(hist))
			throw "src or hist" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(accumulate)) accumulate = 0;
		if(cv.cvUndefinedOrNull(mask)) mask = 0;
		if(mask != 0) throw "mask は現在サポートされていません";

		for(var k = 0 ; k < hist.ranges.length ; k++){
			if(accumulate == 0){
				for(var i = 0; i < hist.bins[k].length; i++) hist.bins[k][i] = 0;
			}
			
			var binWidth = (hist.ranges[k][1] - hist.ranges[k][0])/hist.bins[k].length;
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					var v = src.RGBA[(j + i * src.width) * CHANNELS + k] ;
					if(hist.ranges[k][0] <= v && hist.ranges[k][1] > v){
						v = Math.floor((v - hist.ranges[k][0])/binWidth);
						if(v < hist.bins[k].length) hist.bins[k][v]++;
					}
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvCalcHist : " + ex);
	}
}

//ヒストグラムを均一化する
//入力
//src IplImage型 ヒストグラムを均一化する画像
//dst IplImage型 ヒストグラムが均一化された画像画像
//color int型 0縲鰀3のみ どの色情報を均一化するか
cv.cvEqualizeHist = function (src, dst, color){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst))
			throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		else if(src.width != dst.width || src.height != dst.height)
			throw ERROR.DIFFERENT_SIZE;
		if(cv.cvUndefinedOrNull(color) || color < 0 || color > 2)
			throw "color" + ERROR.ONLY_NUMBER;

			function getMinMax(histBins, mins, maxs, pix_mins, pix_maxs, ave){
				var rest = 0;
				var now = 0;
				var pixels;
				var a, b;
				for(var i = 0 ; i < 256 ; i++){
					pixels = rest + histBins[i];
					mins[i] = now;
					if(rest > 0) pix_mins[i] = ave -rest;
					else pix_mins[i] = ave + 100;
					a = pixels / ave;
					rest = pixels % ave;
					maxs[i] = now + a;
					if(rest > 0) pix_maxs[i] = rest;
					else pix_maxs[i] = ave + 100;
					now += a; 
				}
				for(var i = 0 ; i < 255 ; i++){
					if(mins[i] > 255) mins[i] = 255;
					if(maxs[i] > 255) maxs[i] = 255;
				}
			}
			
			function getHistEqu(x, nows, mins, maxs, pixs_min, pixs_max){
				var res;
				if(nows[x] == maxs[x]){
					if(pixs_max[x] <= 0) nows[x] = mins[x];
					else pixs_max[x]--;
				}
				if(nows[x] == mins[x]){
					if(pixs_min[x] <= 0) nows[x] = mins[x]+1;
					else pixs_min[x]--;
				}
				if(nows[x] > maxs[x]) nows[x] = mins[x];
				res = nows[x];
				nows[x]++;
				return res;
			}
			
			//--ヒストグラム作成--
			var hist = new Array(256);
			for(var i = 0 ; i < 256; i++) hist[i] = 0;
			for(var i =0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					var v = src.RGBA[color + (j + i * src.width) * CHANNELS];
					hist[v]++;
				}
			}
			
			var omax = new Array(256);
			var omin = new Array(256);
			var pix_max = new Array(256);
			var pix_min = new Array(256);
			var onow = new Array(256);
			
			var ave = Math.floor(src.width * src.height / 256);
			
			getMinMax(hist, omin, omax, pix_min, pix_max, ave);
			for(var i = 0 ; i < 256; i++) onow[i] = omin[i];
			//--ヒストグラムの均等化--
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					var v = src.RGBA[color + (j + i * src.width) * CHANNELS];			
					var vv = getHistEqu(v, onow, omin, omax, pix_min, pix_max);
					dst.RGBA[color + (j + i * dst.width) * CHANNELS] = Math.floor(vv);
				}
			}
	}
	catch(ex){
		alert("cv.cvEqualizeHist : " + ex);
	}
}


//最大値と最小値とその座標を求める
//入力
//src IplImage型 計算対象となる画像
//min_val 数値型の配列 要素数4 RGB表色系ならばr,g,b,aの最小値が入る 
//max_val 数値型の配列 要素数4 RGB表色系ならばr,g,b,aの最大値が入る 
//min_locs cv.cvPoint型の配列 要素数4 RGB表色系ならばr,g,b,aの最小値のピクセルの座標が入る
//max_locs cv.cvPoint型の配列 要素数4 RGB表色系ならばr,g,b,aの最大値のピクセルの座標が入る
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
cv.cvMinMaxLoc = function (src, min_val, max_val, min_locs, max_locs, mask){
	
	try{
		if(cv.cvUndefinedOrNull(src) || 
			cv.cvUndefinedOrNull(min_val) || cv.cvUndefinedOrNull(max_val) ||
			cv.cvUndefinedOrNull(min_locs) || cv.cvUndefinedOrNull(max_locs))
				throw "src or min_val or max_val or min_locs or max_locs " + ERROR.IS_UNDEFINED_OR_NULL;
		for(var i = 0 ; i < min_locs.length ; i++)
			if(cv.cvUndefinedOrNull(min_locs[i])) throw "min_locs[" + i + "]" + ERROR.IS_UNDEFINED_OR_NULL;
		for(var i = 0 ; i < max_locs.length ; i++)
			if(cv.cvUndefinedOrNull(max_locs[i])) throw "max_locs[" + i + "]" + ERROR.IS_UNDEFINED_OR_NULL;
			
		if(cv.cvUndefinedOrNull(mask)) mask = 0;
		if(mask != 0) throw "mask は現在サポートされていません";
		
		for(var c = 0 ; c < CHANNELS ; c++){
			min_val[c] = src.RGBA[c];
			max_val[c] = src.RGBA[c];
			min_locs[c].x = 0 ;
			min_locs[c].y = 0;
			max_locs[c].x = 0 ;
			max_locs[c].y = 0;
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					if(src.RGBA[c + (j + i * src.width) * CHANNELS] < min_val[c]){
						min_val[c] = src.RGBA[c + (j + i * src.width) * CHANNELS];
						min_locs[c].x = j;
						min_locs[c].y = i;
					}
					if(src.RGBA[c + (j + i * src.width) * CHANNELS] > max_val[c]){
						max_val[c] = src.RGBA[c + (j + i * src.width) * CHANNELS];
						max_locs[c].x = j;
						max_locs[c].y = i;
					}
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvMinMaxLoc : " + ex);
	}
}

//画像のゼロでない画素数を数える
//入力
//src IplImage型 計算対象となる画像
//出力
//cv.cvScalar型 RGB表色系ならr,g,b,aの結果が代入されている
cv.cvCountNonZero = function (src){
	var rtn = null;	
	try{
		if(cv.cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		
		rtn = new cv.cvScalar();
		for(var k = 0 ; k < rtn.length ; rtn.val[k++] = 0);
		
		for(var i = 0 ; i < src.height ; i++){
			for(var j = 0 ; j < src.width ; j++){
				for(var c = 0 ; c < CHANNELS ; c++){
					if(src.RGBA[c + (j + i * src.width) * CHANNELS] != 0)
						rtn.val[c]++;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvCountNonZero : " + ex);
	}
	
	return rtn;
}

//画像の画素の合計値
//入力
//src IplImage型 計算対象となる画像
//出力
//cv.cvScalar型 RGB表色系ならr,g,b,aの結果が代入されている
cv.cvSum = function (src){
	var rtn = null;
	try{
		if(cv.cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		
		rtn = new cv.cvScalar();
		
		for(var k = 0 ; k < rtn.length ; rtn[k++] = 0);
		
		for(var i = 0 ; i < src.height ; i++){
			for(var j = 0 ; j < src.width ; j++){
				for(var c = 0 ; c < CHANNELS ; c++)
					rtn[c] = src.RGBA[c + (j + i * src.width) * CHANNELS];
			}
		}
	}
	catch(ex){
		alert("cv.cvSum : " + ex);
	}
	
	return rtn;
}

//画像の画素の平均値
//入力
//src IplImage型 計算対象となる画像
//mask IplImage型 0か255のマスク画像 省略可
//出力
//cv.cvScalar型 RGB表色系ならr,g,b,aの結果が代入されている
cv.cvAvg = function (src, mask){
	var rtn = null;
	try{
		if(cv.cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(mask)) mask = 0;
		if(mask != 0) throw "mask は現在サポートされていません";
		
		rtn = cv.cvSum(src);
		var len = src.width * src.height;
		
		for(var k = 0 ; k < rtn.length ; rtn[k++] /= len);
		
	}
	catch(ex){
		alert("cv.cvAvg : " + ex);
	}
	
	return rtn;
}

//画像の画素の平均値と分散を求める
//入力
//src IplImage型 計算対象となる画像
//mean cv.cvScalar型 平均値が入る RGB表色系ならr,g,b,aの結果が代入されている
//vrn cv.cvScalar型 分散が入る RGB表色系ならr,g,b,aの結果が代入されている
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
cv.cvAvgVrn = function (src, mean, vrn, mask){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(mean) || cv.cvUndefinedOrNull(vrn))
			throw "src or mean or vrn" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(mask)) mask = 0;
		if(mask != 0) throw "mask は現在サポートされていません";
		
		var avg = cv.cvAvg(src);
		for(var c = 0 ; c < CHANNELS ; c++){
			mean[c] = avg[c];
			vrn[c] = 0;
			var len = src.width * src.height;
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){				
					var a = src.RGBA[c + (j + i * src.width) * CHANNELS] - mean[c];
					vrn[c] += a * a;
				}
			}
			vrn[c] /= len;
		}
	}
	catch(ex){
		alert("cv.cvAvgVrn : " + ex);
	}
}

//画像の画素の平均値と標準偏差を求める
//入力
//src IplImage型 計算対象となる画像
//mean cv.cvScalar型 平均値が入る RGB表色系ならr,g,b,aの結果が代入されている
//vrn cv.cvScalar型 標準偏差が入る RGB表色系ならr,g,b,aの結果が代入されている
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
cv.cvAvgSdv = function (src, mean, std, mask){
	cv.cvAvgVrn(src, mean, std, mask);
	for(var k = 0 ; k < std.length ; k++)
		std[k] = Math.sqrt(std[k]);
}

//画像のラベリングをおこなう
//入力
//src IplImage型 GRAY表色系の2値画像推奨(RGB表色系ならRの数値だけで処理する 画素は0か255にしておく)
//出力
//IplImage型
//GRAY表色系の画像
//各画素に0からnまでのラベルが代入されている
cv.cvLabeling = function (src){
	var dst = null;
	try{
		var dmy = cv.cvCloneImage(src);
		dst = cv.cvCreateImage(src.width, src.height);
				
		for(var i = 0 ; i < dst.height ; i++){
			for(var j = 0 ; j < dst.width ; j++){
				dst.RGBA[(j + i * dst.width) * CHANNELS] = 0;
			}
		}
		
		var lut = new Array(dmy.width * dmy.height);
		for(var i = 0 ; i < lut.length ; i++) lut[i] = i;

		var newNumber = 1;
		var MAX = dmy.width * dmy.height;
		var check = new Array(4);
		
		for(var i = 0 ; i < dmy.height ; i++){
			for(var j = 0 ; j < dmy.width ; j++){
				if(dmy.RGBA[(j + i * dmy.width) * CHANNELS] == 255){
					if(i == 0 && j == 0){
						dst.RGBA[(j + i * dst.width) * CHANNELS] = newNumber;
						newNumber++;
					}
					else{
						check[0] = (j - 1 < 0 || i - 1 < 0) ? MAX : dst.RGBA[(j - 1 + (i - 1) * dmy.width) * CHANNELS];
						check[1] = (i - 1 < 0) ? MAX : dst.RGBA[(j + (i - 1) * dmy.width) * CHANNELS];
						check[2] = (j + 1 > dmy.width - 1 || i - 1 < 0) ? MAX : dst.RGBA[(j + 1 + (i - 1) * dmy.width) * CHANNELS];
						check[3] = (j - 1 < 0) ? MAX : dst.RGBA[(j - 1 + i * dmy.width) * CHANNELS];
						check.sort( function(a,b) {return a-b;} );
						
						var m = check.length;
						for(var n = 3 ; n >= 0 ; n--){
							if(check[n] != 0 && check[n] != MAX) m = n;
						}
						
						if(m == check.length){
							dst.RGBA[(j + i * dst.width) * CHANNELS] = newNumber;
							newNumber++;
						}
						else{							
							dst.RGBA[(j + i * dst.width) * CHANNELS] = check[m];
							c = m + 1;
							for(var n = c ; n < check.length ; n++){
								if(check[n] != MAX && lut[check[n]] > check[m])	lut[check[n]] = check[m];
							}
						}
					}
				}
			}
		}

		for(var i = 0 ; i < dmy.height ; i++){
			for(var j = 0 ; j < dmy.width ; j++){
				while(true){
					var v = dst.RGBA[(j + i * dst.width) * CHANNELS];
					var n = lut[v];
					if(v == n) break;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = n;
				}			
			}
		}		
	}
	catch(ex){
		alert("Labeling : " + ex);
	}
	return dst;
}

//円を描く
//入力
//src IplImage型 図が描かれる画像
//center cv.cvPoint型 円の中心座標
//radius int型 半径
//color cv.cvScalar型 円の色
//thickness 奇数 円周の太さ 0以上の値 0の場合、円は塗り潰される 省略可
//出力
//なし
cv.cvCircle = function (img, center, radius, color, thickness){
	try{
		if(cv.cvUndefinedOrNull(img) || cv.cvUndefinedOrNull(center) 
			|| cv.cvUndefinedOrNull(radius) || cv.cvUndefinedOrNull(color))
				throw "img or center or radius or color" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(thickness)) thickness = 1;
		else if(thickness > 0 && thickness %2 == 0) throw "thickness" + ERROR.ONLY_ADD_NUMBER;
		
		if(thickness > 0){
			var thick2 = Math.floor(thickness/2);
			var radiusMax = radius + thick2;
			var radiusMin = radius - thick2;
			
			var xS = center.x - radiusMax;
			var xE = center.x + radiusMax;
			var yS = center.y - radiusMax;
			var yE = center.y + radiusMax;
			
			if(xS < 0) xS = 0 ;
			else if(xS > img.width - 1) xS = img.width - 1;
			if(xE < 0) xE = 0 ;
			else if(xE > img.width - 1) xE = img.width - 1;
			if(yS < 0) yS = 0 ;
			else if(yS > img.height - 1) yS = img.height - 1;
			if(yE < 0) yE = 0 ;
			else if(yE > img.height - 1) yE = img.height - 1;

			for(var x = xS ; x <= xE ; x++){
				for(var y = yS ; y <= yE ; y++){
					var r = (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y);
					if(r >= radiusMin*radiusMin && r <= radiusMax*radiusMax){
						img.RGBA[(x + y * img.width) * CHANNELS] = color.val[0];
 						img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.val[1];
 						img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.val[2];
					}
				}
			}
		}
		else{
			var xS = center.x - radius;
			var xE = center.x + radius;
			var yS = center.y - radius;
			var yE = center.y + radius;
			
			if(xS < 0) xS = 0 ;
			else if(xS > img.width - 1) xS = img.width - 1;
			if(xE < 0) xE = 0 ;
			else if(xE > img.width - 1) xE = img.width - 1;
			if(yS < 0) yS = 0 ;
			else if(yS > img.height - 1) yS = img.height - 1;
			if(yE < 0) yE = 0 ;
			else if(yE > img.height - 1) yE = img.height - 1;

			for(var x = xS ; x <= xE ; x++){
				for(var y = yS ; y <= yE ; y++){
					var r = (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y);
					if(r <= radius*radius){
						img.RGBA[(x + y * img.width) * CHANNELS] = color.val[0];
 						img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.val[1];
 						img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.val[2];
					}
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvCircle : " + ex);
	}
}

//矩形を描く
//入力
//src IplImage型 図が描かれる画像
//pt1 cv.cvPoint型 矩形の左上の座標
//pt2 cv.cvPoint型 矩形の右下の座標
//color cv.cvScalar型 矩形の色
//thickness 奇数 外周の太さ 0以上の値 0の場合、矩形は塗り潰される 省略可
//出力
//なし
cv.cvRectangle = function (img, pt1, pt2, color, thickness){
	try{
		if(cv.cvUndefinedOrNull(img) || cv.cvUndefinedOrNull(pt1) 
			|| cv.cvUndefinedOrNull(pt2) || cv.cvUndefinedOrNull(color))
				throw "img or pt1 or pt2 or color" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(thickness)) thickness = 1;
		else if(thickness > 0 && thickness %2 == 0) throw "thickness" + ERROR.ONLY_ADD_NUMBER;
		
		var xS = (pt1.x < pt2.x) ? pt1.x : pt2.x;
		var xE = (pt1.x < pt2.x) ? pt2.x : pt1.x;
		var yS = (pt1.y < pt2.y) ? pt1.y : pt2.y;
		var yE = (pt1.y < pt2.y) ? pt2.y : pt1.y;
		
		if(xS < 0) xS = 0 ;
		else if(xS > img.width - 1) xS = img.width - 1;
		if(xE < 0) xE = 0 ;
		else if(xE > img.width - 1) xE = img.width - 1;
		if(yS < 0) yS = 0 ;
		else if(yS > img.height - 1) yS = img.height - 1;
		if(yE < 0) yE = 0 ;
		else if(yE > img.height - 1) yE = img.height - 1;

		if(thickness <= 0){
			for(var y = yS ; y <= yE ; y++){
				for(var x = xS ; x <= xE ; x++){
					img.RGBA[(x + y * img.width) * CHANNELS] = color.val[0];
 					img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.val[1];
 					img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.val[2];
				}
			}
		}
		else{
			var pt3 = new cv.cvPoint();
			var pt4 = new cv.cvPoint();
			pt3.x = pt1.x; pt3.y = pt2.y;
			pt4.x = pt2.x; pt4.y = pt1.y;
			
			cv.cvLine(img, pt1, pt3, color, thickness);
			cv.cvLine(img, pt3, pt2, color, thickness);
			cv.cvLine(img, pt2, pt4, color, thickness);
			cv.cvLine(img, pt1, pt4, color, thickness);
		}
	}
	catch(ex){
		alert("cv.cvRectangle : " + ex);
	}
}

//線分または直線を描く
//src IplImage型 図が描かれる画像
//pt1 cv.cvPoint型 直線の左上の座標
//pt2 cv.cvPoint型 直線の右下の座標
//color cv.cvScalar型 矩形の色
//thickness 奇数 外周の太さ 1以上の値 省略可
//isSegment true/false trueなら線分 falseなら直線 省略可
//出力
//なし
cv.cvLine = function (img, pt1, pt2, color, thickness, isSegment){
	try{
		if(cv.cvUndefinedOrNull(img) || cv.cvUndefinedOrNull(pt1) 
			|| cv.cvUndefinedOrNull(pt2) || cv.cvUndefinedOrNull(color))
				throw "img or pt1 or pt2 or color" + ERROR.IS_UNDEFINED_OR_NULL;
				
		if(cv.cvUndefinedOrNull(thickness)) thickness = 1;
		else if(thickness %2 == 0) throw "thickness" + ERROR.ONLY_ADD_NUMBER;
		
		if(cv.cvUndefinedOrNull(isSegment)) isSegment = true;

		var tE = Math.floor(thickness/2);
		var tS = -1*tE;

		if(pt1.x == pt2.x){
			var x = pt1.x;
			var yS, yE;
			if(isSegment){
				yS = (pt1.y < pt2.y) ? pt1.y : pt2.y;
				yE = (pt1.y < pt2.y) ? pt2.y : pt1.y;
				if(yS < 0) yS = 0 ;
				else if(yS > img.height - 1) yS = img.height - 1;
				if(yE < 0) yE = 0 ;
				else if(yE > img.height - 1) yE = img.height - 1;
			}
			else{
				yS = 0; yE = img.height - 1;
			}
			
			
			for(var y = yS ; y <= yE ; y++){
				for(var tx = tS ; tx <= tE ; tx++){
					for(var ty = tS ; ty <= tE ; ty++){
						var xx = x + tx;
						var yy = y + ty;
						if(xx >= 0 && xx <= img.width - 1 && yy >= 0 && yy <= img.height - 1 &&
							tx * tx + ty * ty <= tE * tE){
							img.RGBA[(xx + yy * img.width) * CHANNELS] = color.val[0];
 							img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.val[1];
 							img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.val[2];						}
					}
				}
			}
		}
		else{
			var katamuki = (pt1.y - pt2.y)/(pt1.x - pt2.x);
			
			
			
			if(Math.abs(katamuki) > 1){
				var yS, yE;
				if(isSegment){
					yS = (pt1.y < pt2.y) ? pt1.y : pt2.y;
					yE = (pt1.y < pt2.y) ? pt2.y : pt1.y;
					if(yS < 0) yS = 0 ;
					else if(yS > img.height - 1) yS = img.height - 1;
					if(yE < 0) yE = 0 ;
					else if(yE > img.height - 1) yE = img.height - 1;
				}
				else{
					yS = 0; yE = img.height - 1;
				}
				
				for(var y = yS ; y <= yE ; y++){
					var x = Math.floor((y - pt1.y) / katamuki) + pt1.x ;
					for(var tx = tS ; tx <= tE ; tx++){
						for(var ty = tS ; ty <= tE ; ty++){
							var xx = x + tx;
							var yy = y + ty;
							if(xx >= 0 && xx <= img.width - 1 && yy >= 0 && yy <= img.height - 1 &&
								tx * tx + ty * ty <= tE * tE){
 								img.RGBA[(xx + yy * img.width) * CHANNELS] = color.val[0];
 								img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.val[1];
 								img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.val[2];
							}
						}
					}
				}	
			}
			else{
				var xS, xE;
				if(isSegment){
					xS = (pt1.x < pt2.x) ? pt1.x : pt2.x;
					xE = (pt1.x < pt2.x) ? pt2.x : pt1.x;
					if(xS < 0) xS = 0 ;
					else if(xS > img.width - 1) xS = img.width - 1;
					if(xE < 0) xE = 0 ;
					else if(xE > img.width - 1) xE = img.width - 1;
				}
				else{
					xS = 0; xE = img.width - 1;
				}
				
				for(var x = xS ; x <= xE ; x++){
					var y = Math.floor(katamuki * (x - pt1.x)) + pt1.y;
					
					for(var tx = tS ; tx <= tE ; tx++){
						for(var ty = tS ; ty <= tE ; ty++){
							var xx = x + tx;
							var yy = y + ty;
							if(xx >= 0 && xx <= img.width - 1 && yy >= 0 && yy <= img.height - 1 &&
								tx * tx + ty * ty <= tE * tE){
								img.RGBA[(xx + yy * img.width) * CHANNELS] = color.val[0];
 								img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.val[1];
 								img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.val[2];
							}
						}
					}
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvLine : " + ex);
	}
}

//モルフォロジー変換
//入力
//src IplImage型 変換する前の画像
//dst IplImage型 変換した後の画像
//element cv.cvSize型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数
//operation cv.cv_MOP配列 モルフォロジーの種類
//iterations 整数 変換する回数
//出力
//なし
cv.cvMorphologyEx = function (src, dst, element, operation, iterations){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst) ||
		 cv.cvUndefinedOrNull(element) || cv.cvUndefinedOrNull(operation) ||
		 cv.cvUndefinedOrNull(iterations)) throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		
		switch(operation){
		case cv.cv_MOP.OPEN:
			cv.cvErode(src, dst, element, iterations);
			cv.cvDilate(dst, dst, element, iterations);
		break;
		case cv.cv_MOP.CLOSE:
			cv.cvDilate(src, dst, element, iterations);
			cv.cvErode(dst, dst, element, iterations);
		break; 
		case cv.cv_MOP.GRADIENT:
			var temp1 = cv.cvCreateImage(src.width, src.height);
			var temp2 = cv.cvCreateImage(src.width, src.height);
			cv.cvDilate(src, temp1, element, iterations);
			cv.cvErode(src, temp2, element, iterations);
			cv.cvSub(temp1, temp2, dst);
		break;
		case cv.cv_MOP.TOPHAT:
			var temp = cv.cvCreateImage(src.width, src.height);
			cv.cvMorphologyEx(src, temp, element, cv.cv_MOP.OPEN, iterations);
			cv.cvSub(src, temp, dst);
		break;
		case cv.cv_MOP.BLACKHAT:
			var temp = cv.cvCreateImage(src.width, src.height);
			cv.cvMorphologyEx(src, temp, element, cv.cv_MOP.CLOSE, iterations);
			cv.cvSub(temp, src, dst);
		break;
		default:
			throw "operation" + ERROR.SWITCH_VALUE;
		break;
		}
	}
	catch(ex){
		alert("cv.cvMorphologyEx : " + ex);
	}
}

//画像の収縮
//入力
//src IplImage型 変換する前の画像
//dst IplImage型 変換した後の画像
//iterations 整数 変換する回数 省略可
//element cv.cvSize型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数 省略可
//出力
//なし
cv.cvErode = function (src, dst, iterations, element){
	try{
		cv.cvDilateOrErode(src, dst, true, iterations, element);
	}
	catch(ex){
		alert("cv.cvErode : " + ex);
	}
}

//画像の膨張
//入力
//src IplImage型 変換する前の画像
//dst IplImage型 変換した後の画像
//iterations 整数 変換する回数 省略可
//element cv.cvSize型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数 省略可
//出力
//なし
cv.cvDilate = function (src, dst, iterations, element){
	try{
		cv.cvDilateOrErode(src, dst, false, iterations, element);
	}
	catch(ex){
		alert("cv.cvDilate : " + ex);
	}
}

//積分画像を生成
//入力
//src IplImage型 原画像
//dst IplImage型 生成される積分画像
//squm IplImage型 各ピクセルを2乗して積分画像 省略可
//tilted_sum IplImage型 45度回転させた積分画像 省略可
//出力
//なし
cv.cvIntegral = function (src, dst, sqsum, tilted_sum){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		cv.cvZero(dst);
		if(!cv.cvUndefinedOrNull(sqsum)){
			if(src.width != sqsum.width || src.height != sqsum.height) throw ERROR.DIFFERENT_SIZE;
			cv.cvZero(sqsum);
		}
		if(!cv.cvUndefinedOrNull(tilted_sum)){
			if(src.width != tilted_sum.width || src.height != tilted_sum.height) throw ERROR.DIFFERENT_SIZE;
			cv.cvZero(tilted_sum);
		}
		
		for(var i = 0 ; i < dst.height ; i++){
			for(var j = 0 ; j < dst.width ; j++){
				for(var c = 0 ; c < CHANNELS - 1; c++){
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = 
						src.RGBA[c + (j + i * src.width) * CHANNELS] + ((j == 0) ? 0 : dst.RGBA[c + (j-1 + i * dst.width) * CHANNELS]);
					if(!cv.cvUndefinedOrNull(sqsum))
						sqsum.RGBA[c + (j + i * sqsum.width) * CHANNELS] = 
							src.RGBA[c + (j + i * src.width) * CHANNELS] * src.RGBA[c + (j + i * src.width) * CHANNELS]
							 + ((j == 0) ? 0 : sqsum.RGBA[c + (j-1 + i * sqsum.width) * CHANNELS]);
					if(!cv.cvUndefinedOrNull(tilted_sum))
						tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS] = src.RGBA[c + (j + i * src.width) * CHANNELS] + 
							((j == 0 || i == 0) ? 0 : tilted_sum.RGBA[c + (j-1 + (i-1) * tilted_sum.width) * CHANNELS]);
				}
			}
		}
		for(var j = 0 ; j < dst.width ; j++){
			for(var i = 0 ; i < dst.height ; i++){
				for(var c = 0 ; c < CHANNELS - 1; c++){
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] += ((i == 0) ? 0 : dst.RGBA[c + (j + (i-1) * dst.width) * CHANNELS]);
					if(!cv.cvUndefinedOrNull(sqsum))
						sqsum.RGBA[c + (j + i * sqsum.width) * CHANNELS] += ((i == 0) ? 0 : sqsum.RGBA[c + (j + (i-1) * sqsum.width) * CHANNELS]);

					if(!cv.cvUndefinedOrNull(tilted_sum)){
						tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS]  = src.RGBA[c + (j + i * src.width) * CHANNELS];
						for(var y = 1 ; y <= i ; y++){
							var ii = i - y;
							var jl = j - y;
							var jr = j + y;
							if(jl >= 0) 
								tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS] += src.RGBA[c + (jl + ii * tilted_sum.width) * CHANNELS];
							if(jr < tilted_sum.width) 
								tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS] += src.RGBA[c + (jr + ii * tilted_sum.width) * CHANNELS];
						}
						if(i != 0)
							tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS] += tilted_sum.RGBA[c + (j + (i - 1) * tilted_sum.width) * CHANNELS];	
					}
				
				}
			}
		}
		
	
	}
	catch(ex){
		alert("cv.cvIntegral : " + ex);
	}
}

//画像の複製
//入力
//src IplImage型 複製される画像
//出力
//IplImage型 複製された画像
cv.cvCloneImage = function (src){
	var dst = null;

	try{
		if(cv.cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		dst = cv.cvCreateImage(src.width, src.height);
		cv.cvCopy(src, dst);
	}
	catch(ex){
		alert("cv.cvCloneImage : " + ex);
	}
	
	return dst;
}

//画像の画素のコピー
//入力
//src IplImage型 画素を複製する画像
//dst IplImage型 複製された画素の画像
//出力
//なし
cv.cvCopy = function (src, dst){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		
		for(var i = 0 ; i < src.height ; i++){
			var is =  i * src.width * CHANNELS;
			var js = 0;
			for(var j = 0 ; j < src.width ; j++){
				for(var c = 0 ; c < CHANNELS ; c++)
					dst.RGBA[c + js + is] = src.RGBA[c + js + is];
				js += CHANNELS;
			}
		}
	}
	catch(ex){
		alert("cv.cvCopy : " + ex);
	}
}

//閾値処理
//入力
//src IplImage型 GRAY表色系を推奨(RGB表色系ならRの数値だけで処理する)
//dst IplImage型 閾値処理された画像が代入される
//threshold 整数 解説参照
//max_value 整数 解説参照
//threshold_type cv.cv_THRESHOLD_TYPE 閾値処理の種類
//解説
//cv.cv_THRESHOLD_TYPE.THRESH_BINARYなら srcの画素 > thresholdでmax_value、違えば0をdstの画素に代入
//cv.cv_THRESHOLD_TYPE.THRESH_BINARY_INVなら srcの画素 > thresholdで0、違えばmax_valueをdstの画素に代入
//cv.cv_THRESHOLD_TYPE.THRESH_TRUNCなら srcの画素 > thresholdでthresholdをdstの画素に代入
//cv.cv_THRESHOLD_TYPE.THRESH_TRUNC_TOZEROなら srcの画素 > thresholdでthreshold、違えば0をdstの画素に代入
//cv.cv_THRESHOLD_TYPE.THRESH_TRUNC_TOZERO_INVなら srcの画素 > thresholdで0、違えばthresholdをdstの画素に代入
//cv.cv_THRESHOLD_TYPE.THRESH_OTSUなら srcの画素 > thresholdでthreshold、違えば0をdstの画素に代入
//出力
//なし
cv.cvThreshold = function (src, dst, threshold, max_value, threshold_type){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst) || 
			cv.cvUndefinedOrNull(threshold) || cv.cvUndefinedOrNull(max_value) ||
			cv.cvUndefinedOrNull(threshold_type)) throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL; 
		
		switch(threshold_type){
		case cv.cv_THRESHOLD_TYPE.THRESH_BINARY:
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? max_value : 0;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case cv.cv_THRESHOLD_TYPE.THRESH_BINARY_INV:
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? 0 : max_value;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case cv.cv_THRESHOLD_TYPE.THRESH_TRUNC:
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? threshold : src.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case cv.cv_THRESHOLD_TYPE.THRESH_TRUNC_TOZERO:
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? threshold : 0;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case cv.cv_THRESHOLD_TYPE.THRESH_TRUNC_TOZERO_INV:
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? 0 : threshold;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case cv.cv_THRESHOLD_TYPE.THRESH_OTSU:

 			var histColor = cv.cvCreateHist(1, [256], cv.cv_HIST.ARRAY, [[0, 256]]);
 			cv.cvCalcHist(src, histColor);
 			
 			var hist = histColor.bins[0];
 
 			function Sum(values){
 				var rtn = 0;
 				for(var i = 0 ; i < values.length ; rtn += values[i++]);
 				return rtn;
 			}

			var varDst = 0;
			var sTh = 1;
			for(var th = 1 ; th < 254 ; th++){
				bClass = new Array();
				wClass = new Array();
				for(var i = 0; i < th ; i++) bClass[i] = hist[i];
				var k = 0;
				for(var i = th; i < 255 ; i++) wClass[k++] = hist[i];
				var w1 = 0; var m1 = 0;
				var w2 = 0; var m2 = 0;
				w1 = Sum(bClass);
				w2 = Sum(wClass);
				for(var i = 0; i < bClass.length ; i++) m1 += i * bClass[i];
				for(var i = 0; i < wClass.length ; i++) m2 += (th + i) * wClass[i];
				m1 /= w1;
				m2 /= w2;
				
				var variance = w1 * w2 * (m1 - m2) * (m1 - m2);
				if(varDst < variance){
					varDst = variance;
					sTh = th;
				}
			}
			cv.cvThreshold(src, dst, sTh, max_value, cv.cv_THRESHOLD_TYPE.THRESH_BINARY);
			break;
		default:
			throw "threshold_type" + ERROR.SWITCH_VALUE;
			break;
		}
	}
	catch(ex){
		alert("cv.cvThreshold : " + ex);
	}
}

//画像サイズの変更
//入力
//src IplImage型 原画像
//dst IplImage型 サイズ変換後の画像 この画像サイズに変換される
//interpolation cv.cv_INTER構造体 補完の種類　省略可
//出力
//なし
cv.cvResize = function (src, dst, interpolation){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(interpolation)) interpolation = cv.cv_INTER.NN;
		if(interpolation == cv.cv_INTER.AREA)
			throw "interpolation は現在cv.cv_INTER.AREAをサポートしていません";
		
		var scaleWidth = src.width / dst.width;
		var scaleHeight = src.height / dst.height;

		for(var i = 0 ; i < dst.height ; i++){
			var h = scaleHeight * i ;	
			for(var j = 0 ; j < dst.width ; j++){
				var w = scaleWidth * j;
				for(var  c = 0 ; c < CHANNELS ; c++){
					var v = 0;
					switch(interpolation){
					case cv.cv_INTER.NN:
						w = Math.floor(w + 0.5);
						h = Math.floor(h + 0.5);
						v = src.RGBA[c + (w + h * src.width) * CHANNELS];
					break;
					case cv.cv_INTER.LINEAR:
						var intW = Math.floor(w);
						var intH = Math.floor(h);
						var nextW = intW + 1; if(nextW > src.width - 1) nextW = src.width - 2;
						var nextH = intH + 1; if(nextH > src.height - 1) nextH = src.height - 2;
						var w1 = nextW - w;
						var h1 = nextH - h;
						var w2 = w - intW;
						var h2 = h - intH;
						v = w1 * h1 * src.RGBA[c + (intW + intH * src.width) * CHANNELS] +
								w1 * h2 * src.RGBA[c + (nextW + intH * src.width) * CHANNELS] +
								w2 * h1 * src.RGBA[c + (intW + nextH * src.width) * CHANNELS] +
								w2 * h2 * src.RGBA[c + (nextW + nextH * src.width) * CHANNELS] ;
					break;
					case cv.cv_INTER.AREA: break;
					case cv.cv_INTER.CUBIC:
						var ha = -2;
						var hym = cv.cvCreateMat(1, 4);
						var hxm = cv.cvCreateMat(4, 1);
						var srcm = cv.cvCreateMat(4, 4);
						var dstm1 = cv.cvCreateMat(1, 4);
						var dstm2 = cv.cvCreateMat(1, 1);
						var intW = Math.floor(w);
						var intH = Math.floor(h);
						var x2 = w - intW
						var x1 = x2 + 1;
						var x3 = intW + 1 - w;
						var x4 = x3 + 1;
						var y2 = h - intH;
						var y1 = y2 + 1;
						var y3 = intH + 1 - h;
						var y4 = y3 + 1;
						
						function sinc(t, a){
							var absT = Math.abs(t);
							var absT2 = absT * absT;
							var absT3 = absT2 * absT;
							return (absT > 2) ? 0 :
									(absT <= 1) ? 
										(a + 2) * absT3  - (a + 3) * absT2 + 1 :
										a * absT3 - 5 * a * absT2 + 8 * a * absT - 4 * a;
						}
						
						hym.vals[0] = sinc(y1, ha);
						hym.vals[1] = sinc(y2, ha);
						hym.vals[2] = sinc(y3, ha);
						hym.vals[3] = sinc(y4, ha);
						
						hxm.vals[0] = sinc(x1, ha);
						hxm.vals[1] = sinc(x2, ha);
						hxm.vals[2] = sinc(x3, ha);
						hxm.vals[3] = sinc(x4, ha);
						
						var ip = intH - 1;
						var in1 = intH + 1;
						var in2 = intH + 2;

						if(intH == 0) ip = 1;
						else if(intH == src.height - 2){
							in2 = src.height - 2;
						}
						else if(intH == src.height - 1){
							in1 = src.height - 2;
							in2 = src.height - 3;
						}
						
						var jp = intW - 1;
						var jn1 = intW + 1;
						var jn2 = intW + 2;
						
						if(intW == 0) jp = 1;
						else if(intW == src.width - 2){
							 jn2 = src.width - 2;
						}
						else if(intW == src.width - 1){
							jn1 = src.width - 2;
							jn2 = src.width - 3;
						}
						
						srcm.vals[0] = src.RGBA[c + (jp + ip * src.width) * CHANNELS];
						srcm.vals[1] = src.RGBA[c + (intW + ip * src.width) * CHANNELS];
						srcm.vals[2] = src.RGBA[c + (jn1 + ip * src.width) * CHANNELS];
						srcm.vals[3] = src.RGBA[c + (jn2 + ip * src.width) * CHANNELS];
						var len = srcm.cols;
						srcm.vals[len] = src.RGBA[c + (jp + intH * src.width) * CHANNELS];
						srcm.vals[1 + len] = src.RGBA[c + (intW + intH * src.width) * CHANNELS];
						srcm.vals[2 + len] = src.RGBA[c + (jn1 + intH * src.width) * CHANNELS];
						srcm.vals[3 + len] = src.RGBA[c + (jn2 + intH * src.width) * CHANNELS];
						len = 2 * srcm.cols;
						srcm.vals[len] = src.RGBA[c + (jp + in1 * src.width) * CHANNELS];
						srcm.vals[1 + len] = src.RGBA[c + (intW + in1 * src.width) * CHANNELS];
						srcm.vals[2 + len] = src.RGBA[c + (jn1 + in1 * src.width) * CHANNELS];
						srcm.vals[3 + len] = src.RGBA[c + (jn2 + in1 * src.width) * CHANNELS];
						len = 3 * srcm.cols;
						srcm.vals[len] = src.RGBA[c + (jp + in2 * src.width) * CHANNELS];
						srcm.vals[1 + len] = src.RGBA[c + (intW + in2 * src.width) * CHANNELS];
						srcm.vals[2 + len] = src.RGBA[c + (jn1 + in2 * src.width) * CHANNELS];
						srcm.vals[3 + len] = src.RGBA[c + (jn2 + in2 * src.width) * CHANNELS];
						
						cv.cvmMul(hym, srcm, dstm1);
						cv.cvmMul(dstm1, hxm, dstm2);
						
						v = dstm2.vals[0];
					
					break;
					default :
						throw "interpolation" + ERROR.SWITCH_VALUE;
					break;
					}
					
					dst.RGBA[c + (j + i * dst.width) * CHANNELS]  = v;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvResize : " + ex);
	}
}

//ルックアップテーブルに従って画素を変換
//入力
//src IplImage型 原画像
//dst IplImage型 画素を変換された後の画像
//lut 整数の配列 長さが256の整数配列 0～255の値が1つずつ代入されている
//color 整数 画像のどの色を変換するか決める値 0～2
//出力
//なし
cv.cvLUT = function (src, dst, lut, color){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst) || cv.cvUndefinedOrNull(color))
			throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL; 
		
		for(var i = 0 ; i < src.height ; i++){
			for(var j = 0 ; j < src.width ; j++){
				var v = src.RGBA[color + (j + i * src.width) * CHANNELS];
				dst.RGBA[color + (j + i * src.width) * CHANNELS]  = lut[v];
			}
		}
	}
	catch(e){
		alert("cv.cvLUT : " + ex);
	}
}

//トーンカーブに従って画素を変換
//左下、右上の2点を指定しその2点間を結ぶ直線をトーンカーブの曲線とみなして変換する
//入力
//src IplImage型 原画像
//dst IplImage型 画素を変換された後の画像
//underX 整数 左下の点のx座標
//underY 整数 左下の点のy座標
//overX 整数 右上の点のx座標
//overY 整数 右上の点のy座標
//color 整数 画像のどの色を変換するか決める値 0～2
//出力
//なし
cv.cvToneCurve = function (src, dst, underX, underY, overX, overY, color){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst) ||
			cv.cvUndefinedOrNull(underX) || cv.cvUndefinedOrNull(underY) ||
			cv.cvUndefinedOrNull(overX) || cv.cvUndefinedOrNull(overY) || 
			cv.cvUndefinedOrNull(color)) throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		
		if(underX != overX){
			var katamuki = (overY - underY) / (overX - underX) ;
			var yseppen = underY - katamuki * underX;

			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					var v = (katamuki * src.RGBA[color + (j + i * src.width) * CHANNELS] + yseppen);
					dst.RGBA[color + (j + i * src.width) * CHANNELS]  = v;
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvToneCurve : " + ex);
	}
}

//２つの画像を混ぜる
//入力
//bg IplImage型 後面の画像
//fg IplImage型 前面の画像
//dst IplImage型 混ぜた後の画像
//blend_mode cv.cv_BLEND_MODE 混ぜ方の種類 省略可
//出力
//なし
cv.cvBlendImage = function (bg, fg, dst, blend_mode){
	try{
		if(cv.cvUndefinedOrNull(bg) || cv.cvUndefinedOrNull(fg)  || cv.cvUndefinedOrNull(dst))
			throw "fg or bg or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(bg.width != fg.width || bg.height != fg.height || 
			bg.width != dst.width || bg.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		if(cv.cvUndefinedOrNull(blend_mode)) blendMode = cv.cv_BLEND_MODE.OVER_LAY;

		var percent = 1;
		for (i = 0; i < bg.height; i++) {
			for (j = 0; j < bg.width; j++) {
				var ch = CHANNELS - 1 ;
				for(var  c = 0 ; c < ch ; c++){
					
					var bgV = bg.RGBA[c + (j + i * bg.width) * CHANNELS] / 255;
					var fgV = fg.RGBA[c + (j + i * bg.width) * CHANNELS] / 255;

					var v;

					switch(blend_mode){
					
					case cv.cv_BLEND_MODE.OVER_LAY://オーバーレイ
						v = bgV < 0.5 ? 2.0 * bgV * percent * fgV : 
							1.0 - 2.0 * (1.0 - bgV) * (1.0 - percent * fgV);
						break;

					case cv.cv_BLEND_MODE.SCREEN: //スクリーン
						v = 1.0 - ( 1.0 - bgV ) * ( 1.0 - fgV );
						break;

					case cv.cv_BLEND_MODE.HARD_LIGHT: // ハードライト
						v = fgV < 0.5 ? 2.0 * bgV * fgV : 1.0 - 2.0 * ( 1.0 - bgV ) * ( 1.0 - fgV );
						break;
						
					case cv.cv_BLEND_MODE.SOFT_LIGHT: // ソフトライト
						v = fgV < 0.5 ? 
								bgV + ( bgV -  bgV * bgV ) * ( 2.0 * fgV - 1.0 ) : 
								bgV <= ( 32.0 / 255.0 ) ? 
								bgV + ( bgV -  bgV * bgV ) * ( 2.0 * fgV - 1.0 ) * ( 3.0 - 8.0 * bgV ) : 
								bgV + ( Math.sqrt( bgV ) - bgV ) * ( 2.0 * fgV - 1.0 );
						break;

					case cv.cv_BLEND_MODE.VIVID_LIGHT: //ビビットライト
						v = fgV < 0.5 ? ( bgV <= 1 - fgV * 2 ? 0.0 : ( bgV - ( 1 - fgV * 2 ) ) / ( fgV * 2 ) ) : 
							( bgV < 2 - fgV * 2 ? bgV / ( 2 - fgV * 2 ) : 1.0 );
						break;
					
					case cv.cv_BLEND_MODE.LINEAR_LIGHT: //リニアライト
						v = fgV < 0.5 ? ( bgV < 1 - fgV * 2 ? 0.0 : fgV * 2 + bgV - 1 ) : 
							( bgV < 2 - fgV * 2 ? fgV * 2 + bgV - 1 : 1.0);
						break;
				
					case cv.cv_BLEND_MODE.PIN_LIGHT: //ピンライト
						v = fgV < 0.5 ? ( fgV * 2 < bgV ? fgV * 2 : bgV) : 
							( fgV * 2 - 1 < bgV ? bgV : fgV * 2 - 1 );
						break;

					case cv.cv_BLEND_MODE.COLOR_DODGE: //覆い焼きカラー
						v = bgV + fgV > 1.0 ? 1.0 : ( bgV > 0.0 ? bgV / ( 1.0 - fgV ) : 0.0 );
						break;

					case cv.cv_BLEND_MODE.LINEAR_DODGE: //覆い焼き（リニア）
						v = bgV + fgV > 1.0 ? 1.0 : ( bgV + fgV );
						break;

					case cv.cv_BLEND_MODE.COLOR_BURN: //焼きこみカラー
						v = fgV + bgV < 1.0 ? 0.0 : fgV > 0.0 ? 1.0 - ( 1.0 - bgV ) / fgV : 1.0;
						break;
			
					case cv.cv_BLEND_MODE.LINEAR_BURN: //焼きこみ（リニア）
						v = bgV + fgV < 1.0 ? 0.0 : ( bgV + fgV - 1.0 );
						break;
					
					case cv.cv_BLEND_MODE.EXCLUSION: //除外
						v = (1.0 - bgV ) * fgV + ( 1.0 - fgV ) * bgV;
						break;
						
					case cv.cv_BLEND_MODE.MUL: //掛け算
						v = bgV * fgV;
						break;
						
					default:
						throw "blend_mode" + ERROR.SWITCH_VALUE;
						break;
					}

					var iv = (255 * v);
					
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = iv;
				}
				
				dst.RGBA[ch + (j + i * dst.width) * CHANNELS] = 255;
			}
		}
	}
	catch(ex){
		alert("cv.cvBlendImage : " + ex);
	}
}

//スムージング
//入力
//src IplImage型 原画像
//dst IplImage型 スムージング後の画像
//smooth_type cv.cv_SMOOTH スムージングの種類
//param1 解説参照
//param2 解説参照
//param3 解説参照
//param4 解説参照
//出力
//なし
//解説
//smooth_typeによってparam1～param4の意味が変わる
//cv.cv_SMOOTH_TYPE.BLUR_NO_SCALE、cv.cv_SMOOTH_TYPE.BLUR、cv.cv_SMOOTH_TYPE.MEDIANの場合
//param1 奇数 スムージング窓の横幅 1以上 省略可
//param2 奇数 スムージング窓の縦幅 1以上 省略可
//param3 未使用
//param4 未使用
//cv.cv_SMOOTH_TYPE.GAUSSIANの場合
//param1 奇数 スムージング窓の横幅 1以上 省略可
//param2 奇数 スムージング窓の縦幅 1以上 省略可
//param3 整数 ガウス関数の横のsigmaの値 0以上 省略可
//param4 整数 ガウス関数の縦のsigmaの値 0以上 省略可
//cv.cv_SMOOTH_TYPE.BILATERALの場合
//param1 奇数 色のsigmaの値 省略可
//param2 奇数 距離のsigmaの値 省略可
//param3 未使用
//param4 未使用
cv.cvSmooth = function (src, dst, smooth_type, param1, param2, param3, param4){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL; 
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		if(cv.cvUndefinedOrNull(smooth_type)) smooth_type = cv.cv_SMOOTH_TYPE.GAUSSIAN;
		
		switch(smooth_type){
		case cv.cv_SMOOTH_TYPE.BLUR_NO_SCALE:
			if(cv.cvUndefinedOrNull(param1)) param1 = 3;
			if(cv.cvUndefinedOrNull(param2)) param2 = param1;
			
			if(param1 < 0) throw "param1" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param2 < 0) throw "param2" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param1 % 2 != 1) throw "param1" + ERROR.ONLY_ADD_NUMBER;
			if(param2 % 2 != 1) throw "param2" + ERROR.ONLY_ADD_NUMBER;
			
			var startX = -1 * Math.floor(param1/2);
			var startY = -1 * Math.floor(param2/2);
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					for(var c = 0 ; c < CHANNELS - 1 ; c++){
						var newValue = 0;
						for(var y = 0 ; y < param2 ; y++){
							var yy = i + y + startY;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(var x = 0 ; x < param1 ; x++){
								var xx = j + x + startX;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								newValue += src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue;
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		break;
		
		case cv.cv_SMOOTH_TYPE.BLUR:
			if(cv.cvUndefinedOrNull(param1)) param1 = 3;
			if(cv.cvUndefinedOrNull(param2)) param2 = param1;
			
			if(param1 < 0) throw "param1" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param2 < 0) throw "param2" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param1 % 2 != 1) throw "param1" + ERROR.ONLY_ADD_NUMBER;
			if(param2 % 2 != 1) throw "param2" + ERROR.ONLY_ADD_NUMBER;
			
			var startX = -1 * Math.floor(param1/2);
			var startY = -1 * Math.floor(param2/2);
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					for(var c = 0 ; c < CHANNELS - 1 ; c++){
						var newValue = 0;
						for(var y = 0 ; y < param2 ; y++){
							var yy = i + y + startY;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(var x = 0 ; x < param1 ; x++){
								var xx = j + x + startX;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								newValue += src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue/(param1 * param2);
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		break;
		
		case cv.cv_SMOOTH_TYPE.GAUSSIAN:
		
			if(cv.cvUndefinedOrNull(param1)) param1 = 3;
			if(cv.cvUndefinedOrNull(param2)) param2 = param1;
			if(cv.cvUndefinedOrNull(param3)) param3 = 0;
			if(cv.cvUndefinedOrNull(param4)) param4 = 0;
			
			if(param1 < 0) throw "param1" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param2 < 0) throw "param2" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param3 < 0) throw "param3" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param4 < 0) throw "param4" + ERROR.ONLY_POSITIVE_NUMBER;
			
			if(param1 % 2 != 1) throw "param1" + ERROR.ONLY_ADD_NUMBER;
			if(param2 % 2 != 1) throw "param2" + ERROR.ONLY_ADD_NUMBER;
			
			if(param3 == 0)
				param3 = (((param1 > param2) ? param2 : param1)/2 - 1) * 0.3 + 0.8;
			
			var array = new Array(param1 * param2);
			var alpha = 2 * param3 * param3;
			var startX = -1 * Math.floor(param1/2);
			var startY = -1 * Math.floor(param2/2);
			
			for(var y = 0 ; y < param2 ; y++){
				var yy = y + startY;
				for(var x = 0 ; x < param1 ; x++){
					var xx = x + startX;
					array[x + y * param1] = Math.exp(-1 * (xx * xx + yy * yy) / alpha);
				}
			}
			
			var sum = 0;
			for(var i = 0 ; i < array.length ; i++) sum += array[i];
			for(var i = 0 ; i < array.length ; i++) array[i] /= sum;

			sum = 0;
			for(var i = 0 ; i < array.length ; i++) sum += array[i];
			
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					for(var c = 0 ; c < CHANNELS - 1 ; c++){
						var newValue = 0;
						for(var y = 0 ; y < param2 ; y++){
							var yy = i + y + startY;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(var x = 0 ; x < param1 ; x++){
								var xx = j + x + startX;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								newValue += array[x + y * param1] * src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue;
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		
		break; 
		
		case cv.cv_SMOOTH_TYPE.MEDIAN:
			
			if(cv.cvUndefinedOrNull(param1)) param1 = 3;
			if(param1 < 0) throw "param1" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param1 % 2 != 1) throw "param1" + ERROR.ONLY_ADD_NUMBER;
			
			var array = new Array(param1 * param1);
			
			var start = -1 * Math.floor(param1/2);
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					for(var c = 0 ; c < CHANNELS - 1 ; c++){
						for(var y = 0 ; y < param1 ; y++){
							var yy = i + y + start;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(var x = 0 ; x < param1 ; x++){
								var xx = j + x + start;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								
								array[x + y * param1] = src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						
						array.sort(function(a,b) {return a-b;});
						
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = array[Math.floor(array.length / 2)];
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		break; 
		
		case cv.cv_SMOOTH_TYPE.BILATERAL:
		
			if(cv.cvUndefinedOrNull(param1)) param1 = 5;
			if(cv.cvUndefinedOrNull(param2)) param2 = 0.2;
			
			var array = new Array(3 * 3);
			
			var param12 = 2*param1*param1;
			var param22 = 2*param2*param2;

			for(var y = 0 ; y < 3 ; y++){
				var yy = y - 1;
				for(var x = 0 ; x < 3 ; x++){
					var xx = x - 1;
					array[x + y * 3] = Math.exp(-1 * (xx * xx + yy * yy) / param12);
				}
			}
			
			for(var i = 0 ; i < src.height ; i++){
				for(var j = 0 ; j < src.width ; j++){
					for(var c = 0 ; c < CHANNELS - 1 ; c++){
						var overValue = 0;
						var underValue = 0;
						for(var y = 0 ; y < 3 ; y++){
							var yy = i + y - 1;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(var x = 0 ; x < 3 ; x++){
								var xx = j + x - 1;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								
								var dist = src.RGBA[c + (j + i * src.width) * CHANNELS] - src.RGBA[c + (xx + yy * src.width) * CHANNELS];
								var v = array[x + y * 3] * Math.exp(-1 * dist * dist / param22) ;
								underValue += v
								overValue += v * src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = overValue/underValue;
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		break; 
		
		default:
			throw "smooth_type" + ERROR.SWITCH_VALUE;
		break;
		}
	}
	catch(ex){
		alert("cv.cvSmooth : " + ex);
	}
}

//ソーベルフィルタ
//入力
//src IplImage型 GRAY表色系の濃淡画像推奨(RGB表色系ならRの数値だけで処理する)
//dst IplImage型 処理後の画像
//xorder 整数 解説参照
//yorder 整数 解説参照
//aperture_size 整数(3,5,7のみ) 窓サイズ 省略可
//出力
//なし
//解説
//xorder,yorderはそれぞれ横方向縦方向のソーベルフィルタの処理回数を意味する
//xorderかyorderのどちらかは0にする
cv.cvSobel = function (src, dst, xorder, yorder, aperture_size){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		if(xorder != 0 && yorder != 0) throw "xorder or yorderのどちらかを0にして下さい";
		if(xorder < 0 || yorder < 0) throw "xorder or yorer " + ERROR.ONLY_POSITIVE_NUMBER;
		if(cv.cvUndefinedOrNull(aperture_size)) aperture_size = 3;
		
		switch(aperture_size){		
		case 3:
			
			var array = (xorder != 0) ? 
				new Array( 
					-1, 0, 1,
					-2, 0, 2,
					-1, 0, 1
				) :
				new Array(
					-1, -2, -1,
					0, 0, 0,
					1, 2, 1
				);
			var times = (xorder != 0) ? xorder : yorder ;
			
			cv.cvCopy(src, dst);
			var dmy = cv.cvCreateImage(src.width, src.height);
			for(var time = 0 ; time < times ; time++){
				cv.cvCopy(dst, dmy);
				for(var i = 0; i < dmy.height ; i++){
					for(var j =0; j < dmy.width ; j++){
						var newValue = 0;
						for(var y = 0 ; y < aperture_size ; y++){
							var yy = i + y -1;
							if(yy < 0) yy *= -1;
							yy %= dmy.height;
							
							for(var x = 0 ; x < aperture_size ; x++){
								var xx = j + x -1;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								
								newValue += array[x + y * 3] * dmy.RGBA[(xx + yy * dmy.width) * CHANNELS];
							}
						}
						dst.RGBA[(j + i * dst.width) * CHANNELS] = newValue;
						dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = newValue;
						dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = newValue;
					}
				}
			}
			
		break;
		
		case 5:
		break;
		
		case 7:
		break;
		
		default:
			throw ERROR.APERTURE_SIZE;
		break;
		}
	}
	catch(ex){
		alert("cv.cvSobel : " + ex);
	}
}

//ケニーフィルタ
//入力
//src IplImage型 GRAY表色系の濃淡画像推奨(RGB表色系ならRの数値だけで処理する)
//dst IplImage型 処理後の画像
//threshold1 解説参照
//threshodl2 解説参照
//aperture_size 整数(3,5,7のみ) 窓サイズ 省略可
//出力
//なし
//解説
//threshold1 と threshold2 のうち
//小さいほうがエッジ同士を接続するために用いられ，大きいほうが強いエッジの初期検出に用いられる
cv.cvCanny = function (src, dst, threshold1, threshold2, aperture_size){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst) ||
		cv.cvUndefinedOrNull(threshold1) || cv.cvUndefinedOrNull(threshold2))
			throw "src or dst or threshold1 or threshold2" + ERROR.IS_UNDEFINED_OR_NULL; 
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;

		if(cv.cvUndefinedOrNull(aperture_size)) aperture_size = 3;
		
		var smooth = cv.cvCreateImage(src.width, src.height);
		cv.cvSmooth(src, smooth);

		var fxImage = cv.cvCloneImage(smooth);
		var fyImage = cv.cvCloneImage(smooth);

		cv.cvSobel(fxImage, fxImage, 1, 0, aperture_size);
		cv.cvSobel(fyImage, fyImage, 0, 1, aperture_size);

		var kobai = cv.cvCreateImage(dst.width, dst.height);
		var kyodo = cv.cvCreateImage(dst.width, dst.height);
		
		//強度と勾配
		for(var i = 0 ; i < kyodo.height ; i++){
			for(var j = 0 ; j < kyodo.width ; j++){
				
				kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] = 
					Math.sqrt(fxImage.RGBA[(j + i * fxImage.width) * CHANNELS] * fxImage.RGBA[(j + i * fxImage.width) * CHANNELS] +
						fyImage.RGBA[(j + i * fyImage.width) * CHANNELS] * fyImage.RGBA[(j + i * fyImage.width) * CHANNELS]);

				var tanV = (fxImage.RGBA[(j + i * fxImage.width) * CHANNELS] == 0) ? 0 : 
					Math.tan(fyImage.RGBA[(j + i * fyImage.width) * CHANNELS]/fxImage.RGBA[(j + i * fxImage.width) * CHANNELS]);

				if(tanV < -2.4141 || tanV > 2.4141)	kobai.RGBA[(j + i * kobai.width) * CHANNELS] = 90;
				else if(tanV < -0.4142) kobai.RGBA[(j + i * kobai.width) * CHANNELS] = 135;
				else if(tanV < 0.4142) kobai.RGBA[(j + i * kobai.width) * CHANNELS] = 0;
				else kobai.RGBA[(j + i * kobai.width) * CHANNELS] = 45;
			}
		}
		
		//細線化
		var th = kobai.height - 1;
		var tw = kobai.width - 1;
		for(var i = 1 ; i < th; i++){
			for(var j = 1 ; j < tw; j++){
				var left = j - 1;
				var right = j + 1;
				var top = i - 1;
				var down = i + 1;

				switch(kobai.RGBA[(j + i * kobai.width) * CHANNELS]){
				case 0:
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
						(kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(left + i * kyodo.width) * CHANNELS] &&
						kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(right + i * kyodo.width) * CHANNELS]) ? 
							kyodo.RGBA[(j + i * dst.width) * CHANNELS] : 0;
				break;
				case 45:
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
						(kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(left + down * kyodo.width) * CHANNELS] &&
						kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(right + top * kyodo.width) * CHANNELS]) ?
							kyodo.RGBA[(j + i * dst.width) * CHANNELS] : 0;
				break;
				case 90:
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
						(kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(j + top * kyodo.width) * CHANNELS] &&
						kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(j + down * kyodo.width) * CHANNELS]) ? 
							kyodo.RGBA[(j + i * dst.width) * CHANNELS] : 0;
				break;
				default:
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
						(kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(left + top * kyodo.width) * CHANNELS] &&
						kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(right + down * kyodo.width) * CHANNELS]) ?
							kyodo.RGBA[(j + i * dst.width) * CHANNELS] : 0;
				break;
				}
			}
		}

		//◆◆閾値処理◆◆
		var bigT = threshold1;
		var smallT = threshold2;
		if(threshold1 < threshold2){
			bigT = threshold2;
			smallT = threshold1;
		}
		
		var m = aperture_size/2;
		
		for(var i = 0 ; i < dst.height ; i++){
			for(var j = 0 ; j < dst.width ; j++){
				if(dst.RGBA[(j + i * dst.width) * CHANNELS] > bigT) dst.RGBA[(j + i * dst.width) * CHANNELS] = 255;
				else if(dst.RGBA[(j + i * dst.width) * CHANNELS] <= bigT && 
					dst.RGBA[(j + i * dst.width) * CHANNELS] > smallT)
				{
					var isEdge = false;
					
					for(var y = -m ; y <= m ; y++){
						top = i - y; if(top < 0) top *= -1;
						down = i + y; if(top > dst.height - 1) top = dst.height - 2;
						for(var x = -m ; x <= m ; x++){
							left = j - x; if(left < 0) left *= -1;
							right = j + x; if(right > dst.width - 1) right = dst.width - 2;
							
							
							if( (x != 0 || y != 0) && dst.RGBA[(left + top * dst.width) * CHANNELS] == 255 ||
								dst.RGBA[(j + top * dst.width) * CHANNELS] == 255 ||
								dst.RGBA[(right + top * dst.width) * CHANNELS] == 255 ||
								dst.RGBA[(left + i * dst.width) * CHANNELS] == 255 ||
								dst.RGBA[(right + i * dst.width) * CHANNELS] == 255 ||
								dst.RGBA[(left + down * dst.width) * CHANNELS] == 255 ||
								dst.RGBA[(j + down * dst.width) * CHANNELS] == 255 ||
								dst.RGBA[(right + down * dst.width) * CHANNELS] == 255){
							
								isEdge = true;
								break;	
							}
						}
						if(isEdge) break;
					}					
					dst.RGBA[(j + i * dst.width) * CHANNELS] = (isEdge) ? 255 : 0;
				}
				else dst.RGBA[(j + i * dst.width) * CHANNELS] = 0;
			}
		}
				
		for(var i = 0 ; i < dst.height ; i++){
			for(var j = 0 ; j < dst.width ; j++){
				dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = 255;
			}
		}
	}
	catch(ex){
		alert("cv.cvCanny : " + ex);
	}
}

//表色系変換
//入力
//src IplImage型 原画像
//dst IplImage型 処理後の画像
//code cv.cv_CODE この値に従って表色系を変換する "X"2"Y"となっておりX表色系からY表色系への変換を意味する
//出力
//なし
cv.cv.cv.cvtColor = function (src, dst, code){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst) || cv.cvUndefinedOrNull(code))
			throw "src or dst or color" + ERROR.IS_UNDEFINED_OR_NULL; 
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		switch(code){
		case cv.cv_CODE.RGB2GRAY:
			for (var i = 0; i < dst.height; i++) {
				for (var j = 0; j < dst.width; j++) {
				
					var v = (src.RGBA[(j + i * dst.width) * CHANNELS] + 
							src.RGBA[1 + (j + i * dst.width) * CHANNELS] + 
							src.RGBA[2 + (j + i * dst.width) * CHANNELS]) / 3;
							
					dst.RGBA[(j + i * dst.width) * CHANNELS] = v;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = v;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = v;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
				}
			}
		break;
		
		case cv.cv_CODE.RGB2HSV:
			
			for (var i = 0; i < dst.height; i++) {
				for (var j = 0; j < dst.width; j++) {
				
					var r = src.RGBA[(j + i * dst.width) * CHANNELS];
					var g = src.RGBA[1 + (j + i * dst.width) * CHANNELS];
					var b = src.RGBA[2 + (j + i * dst.width) * CHANNELS];
					
					var max = Math.max(r, g, b);
					var min = Math.min(r, g, b);
					var h;
					if(max == min) h = 0;
			        else if(max == r) h = ((g - b) / (max - min)) * 60;
			        else if(max == g) h = ((b - r) / (max - min)) * 60 + 120;
			        else h = ((r - g) / (max - min)) * 60 + 240;
			        if(h < 0) h += 360;
			        
			        h = h * 256 / 360;
			        
			        dst.RGBA[(j + i * dst.width) * CHANNELS] = h;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = ( max == 0 ) ? 0 : (max - min) / max * 255;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = max;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];		
				}
			}
		break;
		
		case cv.cv_CODE.HSV2RGB:
			for (var i = 0; i < dst.height; i++) {
				for (var j = 0; j < dst.width; j++) {
				
					var h = src.RGBA[(j + i * dst.width) * CHANNELS];
					var s = src.RGBA[1 + (j + i * dst.width) * CHANNELS];
					var v = src.RGBA[2 + (j + i * dst.width) * CHANNELS];

					var red, green, blue;
					
					if(s == 0) red = green = blue = v;
					else{
						h = h * 360 / 256;
						s /= 255;
						v /= 255;
						var hi = Math.floor(h/60)%6;
						var f = h/60 - hi;
						var p = v * (1 - s);
						var q = v * (1 - f * s);
						var t = v * (1 - (1 - f) * s);
												
						if(hi == 0){
							red = v; green = t; blue = p;
						}
						else if(hi == 1){
							red = q; green = v; blue = p;
						}
						else if(hi == 2){
							red = p; green = v; blue = t;
						}
						else if(hi == 3){
							red = p; green = q; blue = v;
						}
						else if(hi == 4){
							red = t; green = p; blue = v;
						}
						else if(hi == 5){
							red = v; green = p; blue = q;
						}
						
						red *= 255;
						green *= 255;
						blue *= 255;
					}
			
					dst.RGBA[(j + i * dst.width) * CHANNELS] = red;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = green;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = blue;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
				}
			}
		break;
		
		case cv.cv_CODE.RGB2HLS:
			for (var i = 0; i < dst.height; i++) {
				for (var j = 0; j < dst.width; j++) {
				
					var r = src.RGBA[(j + i * dst.width) * CHANNELS];
					var g = src.RGBA[1 + (j + i * dst.width) * CHANNELS];
					var b = src.RGBA[2 + (j + i * dst.width) * CHANNELS];
					
					var max = Math.max(r, g, b);
					var min = Math.min(r, g, b);
					var h;
					if(max == min) h = 0;
			        else if(max == r) h = ((g - b) / (max - min)) * 60;
			        else if(max == g) h = ((b - r) / (max - min)) * 60 + 120;
			        else h = ((r - g) / (max - min)) * 60 + 240;
			        if(h < 0) h += 360;
			        h = h * 256 / 360;
			        
			        var l = (Math.max(r, g, b) / 255 + Math.min(r, g, b) / 255) / 2;
			        var s;
			        if(l <= 0.5) {
			            s = (Math.max(r, g, b) - Math.min(r, g, b)) / (Math.max(r, g, b) + Math.min(r, g, b));
			        } else {
			            s = (Math.max(r, g, b) - Math.min(r, g, b)) / (2 * 255 - Math.max(r, g, b) - Math.min(r, g, b));
			        }
					dst.RGBA[(j + i * dst.width) * CHANNELS] = h;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] =  255 * l;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = 255 * s;

					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
				}
			}
		break;
		
		case cv.cv_CODE.HLS2RGB:
				function calc(n1, n2, hue) {
				    hue = (hue + 180) % 360;
				    if(hue < 60) return n1 + (n2 - n1) * hue / 60;
				    else if(hue < 180) return n2;
				    else if(hue < 240) return n1 + (n2 - n1) * (240 - hue) / 60;
				    else return n1;
				}

			for (var i = 0; i < dst.height; i++) {
				for (var j = 0; j < dst.width; j++) {	
					var h = dst.RGBA[(j + i * dst.width) * CHANNELS];
					var l = dst.RGBA[1 + (j + i * dst.width) * CHANNELS];
					var s = dst.RGBA[2 + (j + i * dst.width) * CHANNELS];
					
					h = h * 360 / 256;
					l /= 255;
					s /= 255;
					
					var max = (l <= 0.5) ? l * (1 + s) : l + s - l * s;
					var min = 2 * l - max;
					
					var r = Math.floor(calc(max, min, h + 120) * 255);
					var g = Math.floor(calc(max, min, h) * 255);
					var b = Math.floor(calc(max, min, h - 120) * 255);
					
					dst.RGBA[(j + i * dst.width) * CHANNELS] = r;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = g;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = b;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];					
				}
			}
		break;
		
		case cv.cv_CODE.RGB2YCbCr:
			for (var i = 0; i < src.height; i++) {
				for (var j = 0; j < src.width; j++) {
					var r = src.RGBA[(j + i * src.width) * CHANNELS];
					var g = src.RGBA[1 + (j + i * src.width) * CHANNELS];
					var b = src.RGBA[2 + (j + i * src.width) * CHANNELS];
					
					var Y = (r + g + b) / 3;
					var Cb = -0.168777 * r - 0.331223 * g + 0.5 * b;
					var Cr = 0.5 * r - 0.418358 * g - 0.081642 * b;
					
					dst.RGBA[(j + i * dst.width) * CHANNELS] = Y;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = Cb;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = Cr;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
					
				}
			}
		break;
		
		case cv.cv_CODE.YCbCr2RGB:
			for (var i = 0; i < src.height; i++) {
				for (var j = 0; j < src.width; j++) {
					var Y = src.RGBA[(j + i * src.width) * CHANNELS];
					var Cb = src.RGBA[1 + (j + i * src.width) * CHANNELS];
					var Cr = src.RGBA[2 + (j + i * src.width) * CHANNELS];
					
					var r = Y + 1.402176 * Cr;
					var g = Y - 0.714489 * Cr - 0.345619 * Cb;
					var b = Y + 1.771046 * Cb;
					
					dst.RGBA[(j + i * dst.width) * CHANNELS] = r;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = g;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = b;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS];					
					
				}
			}
		break;
			
		default:
			throw "code" + ERROR.SWITCH_VALUE;
		break;
		}
	}
	catch(ex){
		alert("cv.cvtColor : " + ex);
	}
}

//画像の四則演算
//全画素に対して四則演算が行われる for(var  cv.cvSub cv.cvMul cv.cvDivで呼び出されることを想定
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2をfour_arithmeticに従って演算する
//four_arithmetic FOUR_ARITHMETIC 四則演算
//出力
//なし
cv.cvFourArithmeticOperations = function (src1, src2, dst, four_arithmetic){
	try{
		if(cv.cvUndefinedOrNull(src1) || cv.cvUndefinedOrNull(src2) || cv.cvUndefinedOrNull(dst) || cv.cvUndefinedOrNull(four_arithmetic))
			throw "src1 or src2 or dst or four_arithmetic" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src1.width != src2.width || src1.height != src2.height ||
			src1.width != dst.width || src1.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		for(var i = 0 ; i < dst.height ; i++){
			for(var j = 0; j < dst.width ; j++){
				for(var c = 0 ; c < CHANNELS ; c++){
					var newValue;
					switch(four_arithmetic){
					case FOUR_ARITHMETIC.ADD:
						newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] + src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					break;
					case FOUR_ARITHMETIC.SUB:
						newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] - src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					break;
					case FOUR_ARITHMETIC.MUL:
						newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] * src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					break;
					case FOUR_ARITHMETIC.DIV:
						newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] / src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					break;
					default:
						throw "four_arithmetic" + ERROR.SWITCH_VALUE;
						return;
					break;
					}
					
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue;
				}
			}
		}
	}
	catch(ex){
		throw ex;
	}
}

//画像の加算
//全画素に対して加算が行われる
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2を加算した結果
//出力
//なし
cv.cvAdd = function (src1, src2, dst){
	try{
		cv.cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.ADD);
	}
	catch(ex){
		alert("cv.cvAdd : " + ex);
	}
}

//画像の減算
//全画素に対して減算が行われる
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2を減算した結果
//出力
//なし
cv.cvSub = function (src1, src2, dst){
	try{
		cv.cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.SUB);
	}
	catch(ex){
		alert("cv.cvSub : " + ex);
	}
}

//画像のかけ算
//全画素に対してかけ算が行われる
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2を割算した結果
//出力
//なし
cv.cvMul = function (src1, src2, dst){
	try{
		cv.cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.MUL);
	}
	catch(ex){
		alert("cv.cvMul : " + ex);
	}
}

//画像の割り算
//全画素に対して割り算が行われる
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2を掛け算した結果
//出力
//なし
cv.cvDiv = function (src1, src2, dst){
	try{
		cv.cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.DIV);
	}
	catch(ex){
		alert("cv.cvDiv : " + ex);
	}
}

//画素を絶対値にする
//入力
//src IplImage型 原画像 cv.cvSobel等で画素値がマイナスのものを想定
//dst IplImage型 画素が絶対値化された画像
//出力
//なし
cv.cvConvertScaleAbs = function (src, dst){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		for(var i = 0 ; i < dst.height ; i++){
			for(var j = 0; j < dst.width ; j++){
				for(var c = 0 ; c < CHANNELS ; c++){
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = Math.abs(src.RGBA[c + (j + i * dst.width) * CHANNELS]);
				}
			}
		}
	}
	catch(ex){
		alert("cv.cvConvertScaleAbs : " + ex);
	}
}

//膨張か縮小 cv.cvDilate cv.cvErodeで呼び出されることを想定
//入力
//src IplImage型 原画像
//dst IplImage型 膨張か収縮をした結果
//isDilate true/false trueなら膨張 falseなら収縮
//iterations 整数 繰り返し回数 省略可
//element cv.cvSize型 窓関数の縦横幅 奇数 省略可
//出力
//なし
cv.cvDilateOrErode = function (src, dst, isDilate, iterations, element){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(dst))
			throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;

		if(cv.cvUndefinedOrNull(element))
		{
			element = new cv.cvSize();
			element.width = 3;
			element.height = 3;
		}
		else if(element.width % 2 == 0 || element.height % 2 == 0)
			throw "element" + ONLY_ADD_NUMBER;

		if(cv.cvUndefinedOrNull(iterations)) iterations = 1;
		
		var ehE = Math.floor(element.height/2);
		var ehS = -1 * ehE;
		var ewE = Math.floor(element.width/2);
		var ewS = -1 * ewE;
				
		cv.cvCopy(src, dst);
		
		var dmy = cv.cvCreateImage(src.width, src.height);
		
		for(var ite = 0 ; ite < iterations ; ite++){
			cv.cvCopy(dst, dmy);
			for(var ih = 0 ; ih < dst.height ; ih++){
				for(var iw = 0 ; iw < dst.width ; iw++){
					var value = isDilate ? 0 : 255;
					for(var eh = ehS ; eh < ehE ; eh++){
						var h = ih + eh;
						if(h >= 0 && h < src.height){
							for(var ew = ewS ; ew < ewE ; ew++){
								var w = iw + ew;
								if(w >= 0 && w < src.width){
									if((isDilate && value < dmy.RGBA[(w + h * dst.width) * CHANNELS]) ||
										(!isDilate && value > dmy.RGBA[(w + h * dst.width) * CHANNELS]))
										value = dmy.RGBA[(w + h * dst.width) * CHANNELS];
								}
							}
						}
					}
					dst.RGBA[(iw + ih * dst.width) * CHANNELS] = value;
					dst.RGBA[1 + (iw + ih * dst.width) * CHANNELS] = value;
					dst.RGBA[2 + (iw + ih * dst.width) * CHANNELS] = value;
				}
			}
		}
	}
	catch(ex){
		throw ex;
	}
} 

//全座標に色を代入
//入力
//src IplImage型 色が代入される画像
//c1 整数 ひとつめの色 (RGB表色系ならR)
//c2 整数 ふたつめの色 (RGB表色系ならG)
//c3 整数 みっつめの色 (RGB表色系ならB)
//a 整数 アルファ値
//出力
//なし
cv.cvSetRGBA = function (src, c1, c2, c3, a){
	try{
		if(cv.cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cv.cvUndefinedOrNull(c1)) c1 = 255;
		if(cv.cvUndefinedOrNull(c2)) c2 = 255;
		if(cv.cvUndefinedOrNull(c3)) c3 = 255;
		if(cv.cvUndefinedOrNull(a)) a = 255;

		var color = new cv.cvScalar();
 		color.val[0] = c1;
 		color.val[1] = c2;
 		color.val[2] = c3;
 		color.val[3] = a;
		
		cv.cvSet(src, color);
	}
	catch(ex){
		alert("cv.cvSetRGBA : " + ex);
	}
}

//全座標に色を代入
//入力
//src IplImage型 色が代入される画像
//color cv.cvScalar型 代入する色
//出力
//なし
cv.cvSet = function (src, color){
	try{
		if(cv.cvUndefinedOrNull(src) || cv.cvUndefinedOrNull(color))
			throw "src or color" + ERROR.IS_UNDEFINED_OR_NULL;
		for(var i = 0 ; i < src.height ; i++){
			for(var j = 0 ; j < src.width ; j++){
 				src.RGBA[(j + i * src.width) * CHANNELS] = color.val[0];
 				src.RGBA[1 + (j + i * src.width) * CHANNELS] = color.val[1];
 				src.RGBA[2 + (j + i * src.width) * CHANNELS] = color.val[2];
 				src.RGBA[3 + (j + i * src.width) * CHANNELS] = color.val[3];
			}
		}
	}
	catch(ex){
		alert("cv.cvSet : " + ex);
	}
}

//全座標にゼロを代入
//入力
//src IplImage型 ゼロが代入される画像
//出力
//なし
cv.cvZero = function (src){
	try{
		if(cv.cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		for(var i = 0 ; i < src.height ; i++){
			var is = i * src.width * CHANNELS;
			var js = 0;
			for(var j = 0 ; j < src.width ; j++){
				for(var c = 0 ; c < CHANNELS - 1 ; src.RGBA[c++ + js + is] = 0);
				src.RGBA[3 + js + is] = 255;
				js+= CHANNELS;
			}
		}
	}
	catch(ex){
		alert("cv.cvZero : " + ex);
	}
}

//undefinedまたはnullチェック
//入力
//value チェックされる入力
//出力
//true/false
cv.cvUndefinedOrNull = function (value){
	return (value === undefined || value === null) ? true : false;
}

//cv.cvLoadImageを呼び出す前に必要な前処理
//htmlのinputタグのonClickで呼び出すことを想定
//入力
//event event型 発生したイベント
//inputId Id型 イベントの発生元のId
//出力
//なし
cv.cvLoadImagePre = function (event, inputId){
	try{
		if(cv.cvUndefinedOrNull(event) || cv.cvUndefinedOrNull(inputId))
				throw "event or inputId" + ERROR.IS_UNDEFINED_OR_NULL;
		var dialog = document.getElementById(inputId);
		dialog.value = "";
	}
	catch(ex){
		alert("cv.cvLoadImagePre : " + ex);
	}
}


//inputタグからiplImageに変換し、imgタグに出力する
//htmlのinputタグのonchangeで呼び出すことを想定
//入力
//event event型 発生したイベント
//imgId  Id型 読み込んだ画像を表示させるimgタグのid
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
cv.cvLoadImage = function (event, imgId, iplImage, maxSize){	
	try{
		if(cv.cvUndefinedOrNull(event) || cv.cvUndefinedOrNull(imgId) || cv.cvUndefinedOrNull(iplImage))
				throw "event or imgId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		var file = event.target.files[0];
		if (file){
			cv.cvLoadImageAtEventFile(file, imgId, iplImage, maxSize);
			event = null;
		}
	}
	catch(ex){
		alert("cv.cvLoadImage : " + ex);
	}
}

//inputタグから複数のiplImageに変換し、複数のimgタグに出力する
//htmlのinputタグのonchangeで呼び出すことを想定
//入力
//event event型 発生したイベント
//imgIds  Id型の配列 読み込んだ画像を表示させるimgタグのid
//iplImages IplImage型の配列 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
cv.cvLoadImages = function (event, imgIds, iplImages, maxSize)
{
	try{
		for(var i = 0 ; i < event.target.files.length ; i++){
			var file = event.target.files[i];
			if (file){
				var imgId = imgIds[i];
				var iplImage = iplImages[i];
				cv.cvLoadImageAtEventFile(file, imgId, iplImage, maxSize);
			}
		}
	}
	catch(ex){
		alert("cv.cvLoadImages : " + ex);
	}
}

//event.target.files配列の要素からiplImageに変換する
//cv.cvLoadImageかcv.cvLoadImagesで呼び出すことを想定
//入力
//file file型 event.target.files配列の要素
//imgId  Id型 読み込んだ画像を表示させるimgタグのid
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
cv.cvLoadImageAtEventFile = function (file, imgId, iplImage, maxSize)
{
	try{
		if(cv.cvUndefinedOrNull(maxSize)) maxSize = -1;
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function(event){
			var imgElement = document.getElementById(imgId);
			imgElement.src = DMY_IMG;
			imgElement.onload = function(){
			    imgElement.src = event.target.result;
			    imgElement.onload = function(){
			    	var originalSize = cv.cvGetOriginalSizeAtImgElement(imgElement);
			    	var scale = 1;
			    	if(maxSize != -1 && (originalSize.width > maxSize || originalSize.height > maxSize))
			    		scale = (originalSize.width > originalSize.height) ? 
				    		maxSize / originalSize.width : maxSize / originalSize.height;
			    	imgElement.width = scale * originalSize.width;
			    	imgElement.height = scale * originalSize.height;
				    iplImage.canvas = cv.cvGetCanvasAtImgElement(imgElement);
				    iplImage.width = iplImage.canvas.width;
				    iplImage.height = iplImage.canvas.height;
				    iplImage.RGBA = new Array(iplImage.width * iplImage.width * CHANNELS);
				    iplImage.imageData = iplImage.canvas.getContext("2d").getImageData(0, 0, iplImage.canvas.width, iplImage.canvas.height);
				    cv.cvImageData2RGBA(iplImage);
				    event = null;
				};
			};
		};
		reader.onerror = function(event){
			console.log(ERROR.NOT_READ_FILE);
			alert(ERROR.NOT_READ_FILE);
//			if (event.target.error.code == event.target.error.NOT_READABLE_ERR) {
//				alert(ERROR.NOT_READ_FILE);
//			}
		};
	}
	catch(ex){
		alert("cv.cvLoadImageAtEventFile : " + ex);
	}
}


//inputタグからIplImage型に変換し、canvasタグに出力する
//htmlのinputタグのonchangeで呼び出すことを想定
//入力
//event event型 発生したイベント
//canvasId  Id型 読み込んだ画像を表示させるcanvasタグのid
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
cv.cvLoadImageToCanvas = function (event, canvasId, iplImage, maxSize){
	try{
		if(cv.cvUndefinedOrNull(event) || cv.cvUndefinedOrNull(canvasId) || cv.cvUndefinedOrNull(iplImage))
				throw "event or canvasId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		var file = event.target.files[0];
		if (file){
			cv.cvLoadImageToCanvasAtEventFile(file, canvasId, iplImage, maxSize);
		}
	}
	catch(ex){
		alert("cv.cvLoadImageToCanvas : " + ex);
	}
}

//event.target.files配列の要素からiplImageに変換しcanvasタグに出力する
//cv.cvLoadImageToCanvasで呼び出すことを想定
//入力
//file file型 event.target.files配列の要素
//canvasId  Id型 読み込んだ画像を表示させるcanvasタグのid
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
cv.cvLoadImageToCanvasAtEventFile = function (file, canvasId, iplImage, maxSize)
{
	try{
		if(cv.cvUndefinedOrNull(maxSize)) maxSize = -1;
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function(event){
			var img = document.createElement('img');
		    img.src = event.target.result;
		    var originalSize = cv.cvGetOriginalSizeAtImgElement(img);
	    	var scale = 1;
	    	if(maxSize != -1 && (originalSize.width > maxSize || originalSize.height > maxSize))
	    		scale = (originalSize.width > originalSize.height) ? 
		    		maxSize / originalSize.width : maxSize / originalSize.height;
	    	img.width = scale * originalSize.width;
	    	img.height = scale * originalSize.height;	    	
	    	iplImage.canvas = document.getElementById(canvasId);
	    	iplImage.canvas.width = img.width;
	    	iplImage.canvas.height = img.height;
	    	iplImage.canvas.getContext("2d").drawImage(img, 0, 0);
		    iplImage.width = iplImage.canvas.width;
		    iplImage.height = iplImage.canvas.height;
		    iplImage.RGBA = new Array(iplImage.width * iplImage.width * CHANNELS);
		    iplImage.imageData = iplImage.canvas.getContext("2d").getImageData(0, 0, iplImage.canvas.width, iplImage.canvas.height);
		   cv.cvImageData2RGBA(iplImage);
		   cv.cvShowImageToCanvas(canvasId, iplImage);
		   event = null;
		};
		reader.onerror = function(event){
			if (event.target.error.code == event.target.error.NOT_READABLE_ERR) {
				alert(ERROR.NOT_READ_FILE);
			}
		};
	}
	catch(ex){
		alert("cv.cvLoadImageToCanvasAtEventFile : " + ex);
	}
}

//IplImage型を生成する
//入力
//width 整数 生成するIplImageのwidth
//height 整数 生成するIplImageのheight
//出力
//IplImage
cv.cvCreateImage = function (width, height){
	var dst = null;
	try{
		if(cv.cvUndefinedOrNull(width) || cv.cvUndefinedOrNull(height))
			throw "width or height" + ERROR.IS_UNDEFINED_OR_NULL;
		else if(width <= 0 || height <= 0)
			throw "width or height" + ERROR.ONLY_POSITIVE_NUMBER;

		dst = new IplImage();
		dst.canvas = document.createElement('canvas');
		dst.canvas.width = width;
		dst.canvas.height = height;
		if (cv.cvUndefinedOrNull(dst.canvas)) throw 'canvas' + ERROR.IS_UNDEFINED_OR_NULL;
		if (! dst.canvas.getContext) throw ERROR.NOT_GET_CONTEXT;
		dst.height = dst.canvas.height;
		dst.width = dst.canvas.width;
		dst.imageData = dst.canvas.getContext("2d").getImageData(0, 0, dst.canvas.width, dst.canvas.height);
		dst.RGBA = new Array(dst.width * dst.width * CHANNELS);
	    for(var i = 0 ; i < dst.height ; i++){
	    	var is = i * dst.width * CHANNELS;
	    	var js = 0;
	    	for(var j = 0 ; j < dst.width ; j++){
	    		for(var c = 0 ; c < CHANNELS - 1; dst.RGBA[c++ + js + is] = 0);
		    	dst.RGBA[3 + js + is] = 255;
		    	js += CHANNELS;
	    	}
	    }
	}
	catch(ex){
		alert("cv.cvCreateImage : " + ex);
	}
	
	return dst;
}

//IplImage型をimgタグに出力する
//入力
//imgId Id型 imgタグのId
//iplImage IplImage型 imgに転送する画像
//出力
//なし
cv.cvShowImage = function (imgId, iplImage){
	try{
		if(cv.cvUndefinedOrNull(imgId) || cv.cvUndefinedOrNull(iplImage))
			throw "imgId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		cv.cvRGBA2ImageData(iplImage);
		if (iplImage.canvas.getContext) {

			iplImage.canvas.getContext("2d").putImageData(iplImage.imageData, 0, 0);
		    var imgElement = document.getElementById(imgId);
		    if(imgElement == null) throw imgId + ERROR.IS_UNDEFINED_OR_NULL;
		 
		 	imgElement.width = iplImage.width;
			imgElement.height = iplImage.height;
		 	
		    imgElement.src = DMY_IMG;
		    imgElement.onload = function(event){
			    imgElement.src = iplImage.canvas.toDataURL('image/jpeg');
			};
		}
		else throw ERROR.NOT_GET_CONTEXT;
	}
	catch(ex){
		alert("cv.cvShowImage : " + ex);
	}
}

//IplImage型をcanvasタグに出力する
//入力
//canvasId Id型 canvasタグのId
//iplImage IplImage型 canvasに転送する画像
//出力
//なし
cv.cvShowImageToCanvas = function (canvasId, iplImage){
	try{
		if(cv.cvUndefinedOrNull(canvasId) || cv.cvUndefinedOrNull(iplImage))
			throw "canvasId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		var canvasElement = document.getElementById(canvasId);
		cv.cvShowImageToCanvasElement	(canvasElement, iplImage);
	}
	catch(ex){
		alert("cv.cvShowImageToCanvas : " + ex);
	}
}

//IplImage型をcanvasエレメントに出力する
//入力
//canvasElement element型 canvasのエレメント
//iplImage IplImage型 canvasに転送する画像
//出力
//なし
cv.cvShowImageToCanvasElement = function (canvasElement, iplImage){
	try{
		if(cv.cvUndefinedOrNull(canvasElement) || cv.cvUndefinedOrNull(iplImage))
			throw "canvasElement or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
	
			cv.cvRGBA2ImageData(iplImage);
		 	canvasElement.getContext("2d").putImageData(iplImage.imageData, 0, 0);
	}
	catch(ex){
		alert("cv.cvShowImageToCanvas : " + ex);
	}
}


//IplImage型のRGBAの値をimageDataへ転送
//cv.cvShowImageで呼び出されることを想定
//入力
//iplImage IplImage型 自身のimageDataへ自身のRGBAの値がコピーされる画像
//出力
//なし
cv.cvRGBA2ImageData = function (iplImage){
	try{
		if(cv.cvUndefinedOrNull(iplImage)) throw "iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		for(var i = 0 ; i < iplImage.height ; i++){
			var is = i * iplImage.width * CHANNELS;
			var js = 0;
			for(var j = 0 ; j < iplImage.width ; j++){
				for(var c = 0 ; c < CHANNELS; c++){
					iplImage.imageData.data[c + js + is] = iplImage.RGBA[c + js + is];
				}
				js += CHANNELS;
			}
		}	
	}
	catch(ex){
		alert("RGBA2ImageData : " + ex);
	}
}
//IplImage型のimageDataの値をRGBAへ転送
//cv.cvLoad**で呼び出されることを想定
//入力
//iplImage IplImage型 自身のRGBAへ自身のimageDataの値がコピーされる画像
//出力
//なし
cv.cvImageData2RGBA = function (iplImage){
	try{
		if(cv.cvUndefinedOrNull(iplImage)) throw "iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		for(var i = 0 ; i < iplImage.height ; i++){
			var is = i * iplImage.width * CHANNELS;
			var js = 0;
			for(var j = 0 ; j < iplImage.width ; j++){
				for(var c = 0 ; c < CHANNELS; c++){
					iplImage.RGBA[c + js + is] = iplImage.imageData.data[c + js + is] ; 
				}
				js += CHANNELS;
			}
		}	
	}
	catch(ex){
		alert("RGBA2ImageData : " + ex);
	}
}

//canvasタグからIplImageへ転送
//入力
//canvasId canvasタグ canvasタグのオブジェクト
//出力
//IplImage型
cv.cvGetIplImageAtCanvas = function (canvasId){
	var iplImage = null;
	try{
		var canvasElement = document.getElementById(canvasId);
		iplImage = cv.cvGetIplImageAtCanvasElement(canvasElement);
	}
	catch(ex){
		alert("cv.cvGetIplImageAtCanvas : " + ex);
	}
	return iplImage;
}

//canvasエレメントからIplImageへ転送
//入力
//canvasElement canvasエレメント canvasのオブジェクト
//出力
//IplImage型
cv.cvGetIplImageAtCanvasElement = function (canvasElement){
	var iplImage = null;
	try{
		if(cv.cvUndefinedOrNull(canvasElement))
			throw "canvas" + ERROR.IS_UNDEFINED_OR_NULL;

		iplImage = cv.cvCreateImage(canvasElement.width, canvasElement.height);
		iplImage.imageData = 
			canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
		cv.cvImageData2RGBA(iplImage);
	}
	catch(ex){
		alert("cv.cvGetIplImageAtCanvasElement : " + ex);
	}
	return iplImage;
}

//imgタグのsrcからiplImageに変換する
//入力
//imgId  Id型 変換されるimgタグ
//出力
//iplImage型
//備考
//ローカル環境では動かない
cv.cvGetIplImageAtImg = function (imgId){
	var iplImage = null;
	try{
		if(cv.cvUndefinedOrNull(imgId)) throw "imgId" + ERROR.IS_UNDEFINED_OR_NULL;
		var imgElement = document.getElementById(imgId);
		iplImage = new IplImage();
	    iplImage.canvas = cv.cvGetCanvasAtImgElement(imgElement);
	    iplImage.width = iplImage.canvas.width;
	    iplImage.height = iplImage.canvas.height;
	    iplImage.RGBA = new Array(iplImage.width * iplImage.width * CHANNELS);
		var context = iplImage.canvas.getContext("2d");
	    iplImage.imageData = context.getImageData(0, 0, iplImage.canvas.width, iplImage.canvas.height);
	    for(var i = 0 ; i < iplImage.height ; i++){
	    	var is = i * iplImage.width * CHANNELS;
			var js = 0;
	    	for(var j = 0 ; j < iplImage.width ; j++){
	    		for(var c = 0 ; c < CHANNELS ; c++){
		    		iplImage.RGBA[c + js + is] = iplImage.imageData.data[c + js + is];
		    	}
		    	js += CHANNELS;
	    	}
		}
	}
	catch(ex){
		alert("cv.cvGetIplImageAtImg : " + ex);
	}
	
	return iplImage;
}


//imgタグからcanvasへ転送
//cv.cvLoadImageで呼び出されることを想定
//入力
//image imgタグ imgタグのオブジェクト
//出力
//canvasタグ
cv.cvGetCanvasAtImgElement = function (image){
	var canvas = null;
	try{
		if(cv.cvUndefinedOrNull(image)) throw "image" + ERROR.IS_UNDEFINED_OR_NULL;
		
		canvas = document.createElement('canvas');	
		
		if(cv.cvUndefinedOrNull(canvas)) throw "canvas" + ERROR.IS_UNDEFINED_OR_NULL;
	    
    	canvas.width = image.width;
    	canvas.height = image.height;
    	
    	canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);    	
	}
	catch(ex){
		alert("cv.cvGetCanvasAtImgElement : " + ex);
	}
	return canvas;
}



//cv.cvMatの内容をalertで表示
cv.cvAlertMat = function (src){
	try{
		var str = "";
		for(var i = 0 ; i < src.rows ; i++){
			for(var j = 0 ; j < src.cols; j++){
				str += src.vals[j + i * src.cols] + ", ";
			}
			str += "\n";
		}
		alert(str);
	}
	catch(ex){
		alert("cv.cvAlertMat : " + ex);
	}
}

// get Image true size
cv.cvGetOriginalSizeAtImgElement = function (image){
	var w = 0 , h = 0 ;
	try{
		if(cv.cvUndefinedOrNull(image)) throw "image" + ERROR.IS_UNDEFINED_OR_NULL;
		
	    w = image.width ;
	    h = image.height ;
	 
	    if ( image.naturalWidth !== undefined ) {  // for Firefox, Safari, Chrome
	        w = image.naturalWidth;
	        h = image.naturalHeight;
	 
	    } else if ( image.runtimeStyle !== undefined ) {    // for IE
	        var run = image.runtimeStyle;
	        var mem = { w: run.width, h: run.height };  // keep runtimeStyle
	        run.width  = "auto";
	        run.height = "auto";
	        w = image.width;
	        h = image.height;
	        run.width  = mem.w;
	        run.height = mem.h;
	 
	    } else {         // for Opera
	        var mem = { w: image.width, h: image.height };  // keep original style
	        image.removeAttribute("width");
	        image.removeAttribute("height");
	        w = image.width;
	        h = image.height;
	        image.width  = mem.w;
	        image.height = mem.h;
	    }
	}
	catch(ex){
		alert("cv.cvGetOriginalSizeAtImgElement : " + ex);
	}

    return {width:w, height:h};
}
 if ('undefined' == typeof module) {
    window.cv = cv;
  } else {
    module.exports = cv;
  }
})();
