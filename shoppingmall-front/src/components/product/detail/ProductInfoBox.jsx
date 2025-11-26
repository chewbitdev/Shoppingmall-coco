import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ProductButton from '../ProductButton';
import SimilarSkinReview from '../../../features/SimilarSkinReview';

// 스타일
const InfoBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProductName = styled.h2`
  font-size: 28px;
  font-weight: bold;
`;

const ProductRating = styled.p`
  font-size: 16px;
  color: #555;
`;

// 시각적으로만 라벨을 숨기는 스타일
const VisuallyHiddenLabel = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ProductPrice = styled.p`
  font-size: 24px;
  font-weight: bold;
  border-top: 1px solid #eee;
  padding-top: 16px;
`;

// 폼 공통 스타일
const CommonFormStyle = `
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const SelectBox = styled.select`
  ${CommonFormStyle}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  font-size: 12px;
  font-weight: 500;
  background: #f0f0f0;
  color: #555;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #ddd;
    color: #000;
  }
`;

// 수량 조절 컨테이너 스타일
const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 150px; /* 적절한 너비 설정 */
  margin-bottom: 20px;
`;

const QuantityBtn = styled.button`
  width: 40px;
  height: 40px;
  background: #f9f9f9;
  border: none;
  font-size: 18px;
  cursor: pointer;
  &:hover { background: #eee; }
`;

const QuantityValue = styled.input`
  flex: 1;
  text-align: center;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  height: 40px;
  font-size: 16px;
  width: 100%;
  &:focus { outline: none; }
  /* Firefox 및 크롬 등에서 기본 화살표(스핀 버튼) 제거 */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
    
  /* Firefox 전용 설정 */
  -moz-appearance: textfield;
`;

// 하단 총 금액 표시용 스타일 컨테이너
const TotalPriceBox = styled.div`
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
  align-items: baseline;     /* 텍스트 라인 맞춤 */
  margin-top: 10px;
  margin-bottom: 20px;
  padding-top: 20px;
  border-top: 1px solid #f4f4f4; /* 구분선 */
`;

const TotalPriceLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-right: 10px;
`;

const TotalPriceValue = styled.span`
  font-size: 26px;
  font-weight: 800;
  color: #333; /* 강조색 */
`;

const skinTypeMap = { all: '모든피부', dry: '건성', oily: '지성', combination: '복합성', sensitive: '민감성' };
const skinConcernMap = {
  hydration: '수분', moisture: '보습', brightening: '미백', tone: '피부톤',
  soothing: '진정', sensitive: '민감', uv: '자외선차단', wrinkle: '주름',
  elasticity: '탄력', pores: '모공'
};
const personalColorMap = {
  spring: '봄 웜톤',
  summer: '여름 쿨톤',
  autumn: '가을 웜톤',
  winter: '겨울 쿨톤'
};

const ProductInfoBox = ({
  product,
  selectedOption,
  setSelectedOption,
  quantity,
  setQuantity,
  handleAddToCart,
  handleBuyNow
}) => {

  // 상태 확인 로직
  const isSoldOut = product.status === '품절' || product.status === 'SOLD_OUT';
  const isStop = product.status === '판매중지' || product.status === 'STOP';
  const isUnavailable = isSoldOut || isStop;

  // 최종 가격 계산 로직
  // 선택된 옵션 객체 찾기
  const selectedOpt = product.options?.find(opt => opt.optionNo === Number(selectedOption));
  
  // 단가 계산 (기본 가격 + 옵션 추가금)
  const unitPrice = product.prdPrice + (selectedOpt?.addPrice || 0);

  // 총 금액 계산 (단가 * 수량)
  const totalPrice = unitPrice * quantity;

  const navigate = useNavigate();

  // 태그 클릭 핸들러
  const handleTagClick = (keyword) => {
    navigate(`/product?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <InfoBox>
      <ProductName>{product.prdName}</ProductName>
      <ProductRating>⭐ {product.averageRating} ({product.reviewCount})</ProductRating>
      <TagContainer>
        {product.skinTypes?.map(type => {
            const label = skinTypeMap[type] || type;
            return <Tag key={type} onClick={() => handleTagClick(label)}># {label}</Tag>
        })}
        {product.skinConcerns?.map(concern => {
            const label = skinConcernMap[concern] || concern;
            return <Tag key={concern} onClick={() => handleTagClick(label)}># {label}</Tag>
        })}
        {product.personalColors?.map(color => {
            const label = personalColorMap[color] || color;
            return <Tag key={color} onClick={() => handleTagClick(label)}># {label}</Tag>
        })}
      </TagContainer>
      {/* 단가 표시 */}
      <ProductPrice> {unitPrice.toLocaleString()}원 </ProductPrice>

      {/* --- 옵션 선택 --- */}
      {product.options && product.options.length > 0 && (
        <div>
          <VisuallyHiddenLabel htmlFor="product-option">상품 옵션 선택</VisuallyHiddenLabel>
          <SelectBox
            id="product-option"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}>
            <option value="">옵션을 선택하세요</option>
            {product.options.map((opt) => (
              <option key={opt.optionNo} value={opt.optionNo}>
                {opt.optionValue}
                {opt.addPrice > 0 ? ` (+${opt.addPrice.toLocaleString()}원)` : ''}
                (재고: {opt.stock})
              </option>
            ))}
          </SelectBox>
        </div>
      )}

      {/* --- 수량 --- */}
      <div>
        <VisuallyHiddenLabel htmlFor="product-quantity">상품 수량</VisuallyHiddenLabel>
        <QuantityControl>
          <QuantityBtn onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</QuantityBtn>
          <QuantityValue
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          />
          <QuantityBtn onClick={() => setQuantity(quantity + 1)}>+</QuantityBtn>
        </QuantityControl>
      </div>

      {/* 총 상품 금액 별도 표시 */}
      <TotalPriceBox>
        <TotalPriceLabel>총 상품 금액</TotalPriceLabel>
        <TotalPriceValue>{totalPrice.toLocaleString()}원</TotalPriceValue>
      </TotalPriceBox>

      <div>
         <SimilarSkinReview productId={product.prdNo} />
      </div>
      {/* 장바구니 버튼 */}
      
      <ButtonGroup>
        <ProductButton
          onClick={handleAddToCart}
          disabled={isUnavailable} // 비활성화
          style={{ opacity: isUnavailable ? 0.5 : 1, flex: 1 }}
        >
          {isSoldOut ? '품절' : (isStop ? '판매 중지' : '장바구니')}
        </ProductButton>

        {/* 바로구매 버튼 */}
        {!isUnavailable && ( // 품절/판매중지가 아닐 때만 표시
          <ProductButton
            primary // 검은색 배경 스타일 적용
            onClick={handleBuyNow}
            style={{ flex: 1 }} // 너비 반반 차지
          >
            바로구매
          </ProductButton>
        )}
      </ButtonGroup>
    </InfoBox>
  );
};

export default ProductInfoBox;
