import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ProductButton from '../ProductButton';


// 스타일 컴포넌트
const CardLink = styled(Link)`
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  text-decoration: none;
  color: black;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 4px;
`;

const CardContent = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProductName = styled.h3`
  font-size: 17px;
  font-weight: 600;
  margin-top: 10px;
`;

const ProductRating = styled.p`
  font-size: 14px;
  color: #666;
  margin-top: 8px;
`;

// 피부 타입 태그
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
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer; /* 클릭 가능하다는 표시 */
  &:hover {
    background-color: #e0e0e0; /* 호버 효과 */
    color: #333;
  }
`;

const ProductPrice = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
  
  margin-top: auto; 
  padding-top: 10px;
`;

// 스타일 추가: 이미지 래퍼 및 품절 오버레이
const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
`;

const SoldOutOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); // 반투명 검정
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border-radius: 4px;
  z-index: 1;
`;

const skinConcernMap = {
  hydration: '수분',
  moisture: '보습',
  brightening: '미백',
  tone: '피부톤',
  soothing: '진정',
  sensitive: '민감',
  uv: '자외선차단',
  wrinkle: '주름',
  elasticity: '탄력',
  pores: '모공'
};

const skinTypeMap = {
  all: '모든 피부',
  dry: '건성',
  oily: '지성',
  combination: '복합성',
  sensitive: '민감성'
};

const personalColorMap = {
  spring: '봄 웜톤',
  summer: '여름 쿨톤',
  autumn: '가을 웜톤',
  winter: '겨울 쿨톤'
};



const ProductCard = ({ product, onAddToCart }) => {
  const isSoldOut = product.status === '품절' || product.status === 'SOLD_OUT';
  const isStop = product.status === '판매중지' || product.status === 'STOP';

  const navigate = useNavigate();

  // 태그 클릭 핸들러
  const handleTagClick = (e, keyword) => {
    e.preventDefault(); // Link 이동 방지
    e.stopPropagation(); // 상위 클릭 이벤트 전파 방지
    
    // 검색 페이지로 이동하며 q 파라미터 전달
    navigate(`/product?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <CardLink to={isSoldOut || isStop ? '#' : `/products/${product.prdNo}`} style={{ cursor: isSoldOut ? 'default' : 'pointer' }}>
      <ImageWrapper>
        <ProductImage src={product.imageUrl} alt={product.prdName} loading="lazy" />
        {/* 품절/판매중지 시 오버레이 표시 */}
        {(isSoldOut || isStop) && (
          <SoldOutOverlay>
            {isSoldOut ? 'SOLD OUT' : '판매 중지'}
          </SoldOutOverlay>
        )}
      </ImageWrapper>

      <CardContent>
        <ProductName>{product.prdName}</ProductName>
        <ProductRating>
          ⭐ {product.averageRating} ({product.reviewCount})
        </ProductRating>
        <TagContainer>
          {/* SkinType 태그 */}
          {product.skinTypes?.map(type => {
            const label = skinTypeMap[type] || type;
            return (
              <Tag key={type} onClick={(e) => handleTagClick(e, label)}>
                # {label}
              </Tag>
            );
          })}
          {/* SkinConcern 태그 */}
          {product.skinConcerns?.map(concern => {
            const label = skinConcernMap[concern] || concern;
            return (
              <Tag key={concern} onClick={(e) => handleTagClick(e, label)}>
                # {label}
              </Tag>
            );
          })}
          {/* personalColor 태그 */}
          {product.personalColors?.map(color => {
            const label = personalColorMap[color] || color;
            return (
              <Tag key={color} onClick={(e) => handleTagClick(e, label)}>
                # {label}
              </Tag>
            );
          })}
        </TagContainer>
        <ProductPrice>{product.prdPrice.toLocaleString()}원</ProductPrice>

        <ProductButton
          onClick={(e) => {
            if (isSoldOut || isStop) {
              e.preventDefault();
              alert("구매할 수 없는 상품입니다.");
            } else {
              onAddToCart(e);
            }
          }}
          $primary
          disabled={isSoldOut || isStop}
          style={{ marginTop: '12px', opacity: (isSoldOut || isStop) ? 0.5 : 1 }}
        >
          {isSoldOut ? '품절' : (isStop ? '판매 중지' : '장바구니 담기')}
        </ProductButton>
      </CardContent>
    </CardLink>
  );
};

export default ProductCard;
