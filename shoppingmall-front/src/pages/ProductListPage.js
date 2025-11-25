import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import ProductCard from '../components/product/list/ProductCard';
import ProductListSkeleton from '../components/product/list/ProductListSkeleton';
import Pagination from '../components/product/list/Pagination';
import ProductSidebar from '../components/product/list/ProductSidebar';
import ProductListHeader from '../components/product/list/ProductListHeader';
import { fetchWithAuth, getStoredMember, isLoggedIn } from '../utils/api';

// 스타일 컴포넌트 정의
const PageContainer = styled.div`
  display: flex;
  padding: 20px 40px;
  max-width: 1280px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const MainContent = styled.main`
  flex: 1;
`;

const ProductListGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
`;

// ---------------------------------------------
// DB/마이페이지 데이터(한글) -> Shop 필터 ID 변환
// ---------------------------------------------

const reverseSkinMap = {
  '건성': 'dry',
  '지성': 'oily',
  '복합성': 'combination',
  '민감성': 'sensitive'
};

const reverseConcernMap = {
  '모공': 'pores',
  '주름': 'wrinkle',
  '건조함': 'moisture',     // 건조함 -> 보습
  '민감함': 'sensitive',    // 민감함 -> 민감
  '여드름': 'soothing',     // 여드름 -> 진정
  '홍조': 'soothing',       // 홍조 -> 진정
  '다크스팟': 'brightening', // 다크스팟 -> 미백
  '칙칙함': 'tone'          // 칙칙함 -> 피부톤
};

const reverseColorMap = {
  '봄 웜톤': 'spring',
  '여름 쿨톤': 'summer',
  '가을 웜톤': 'autumn',
  '겨울 쿨톤': 'winter'
};

// -------------------------------

function ProductListPage() {
  // 상태 관리
  const [products, setProducts] = useState([]); 
  const [totalPages, setTotalPages] = useState(0); 
  const [totalElements, setTotalElements] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 프로필 데이터와 토글 버튼 상태
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileMode, setIsProfileMode] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const closeButtonRef = useRef(null);
  const navigate = useNavigate();

  // URL 파라미터 읽기
  const searchTerm = searchParams.get('q') || '';
  const sortOrder = searchParams.get('sort') || 'popularity';
  const currentPage = Number(searchParams.get('page')) || 1;
  const activeFilters = {
    skinTypes: searchParams.getAll('skinType'),
    skinConcerns: searchParams.getAll('skinConcern'),
    personalColors: searchParams.getAll('personalColor')
  };

  // ------------------------------------------------------
  // 페이지 로드 시 사용자 프로필 정보 가져오기 (로그인 한 경우)
  // ------------------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn()) return;
      
      const member = getStoredMember();
      if (!member || !member.memNo) return;

      try {
        const response = await axios.get(`http://localhost:8080/api/coco/members/profile/${member.memNo}`);
        setUserProfile(response.data);
        
        // 최초 진입 시 필터가 하나도 없다면 자동으로 '내 맞춤' 적용
        
        const hasAnyFilter = searchParams.toString().length > 0;
        if (!hasAnyFilter && response.data) {
           applyProfileFilters(response.data);
        }
        
      } catch (error) {
        console.error("프로필 로드 실패:", error);
      }
    };
    
    fetchProfile();
  }, []);

  // ------------------------------------------------------
  // 필터 적용/해제 로직 (토글 버튼용)
  // ------------------------------------------------------
  
  // 프로필 필터 적용
  const applyProfileFilters = (profileData) => {
    if (!profileData) return;

    const newParams = new URLSearchParams(searchParams);
    let updated = false;

    // 기존 피부 관련 필터는 제거하고 내 프로필로 덮어씌움
    newParams.delete('skinType');
    newParams.delete('skinConcern');
    newParams.delete('personalColor');

    // 피부 타입 매핑
    if (profileData.skinType) {
      const code = reverseSkinMap[profileData.skinType];
      if (code) { newParams.append('skinType', code); updated = true; }
    }
    // 피부 고민 매핑
    if (profileData.concerns && profileData.concerns.length > 0) {
      profileData.concerns.forEach(c => {
        const code = reverseConcernMap[c.trim()];
        if (code) { newParams.append('skinConcern', code); updated = true; }
      });
    }
    // 퍼스널 컬러 매핑
    if (profileData.personalColor) {
      const code = reverseColorMap[profileData.personalColor.trim()];
      if (code) { newParams.append('personalColor', code); updated = true; }
    }

    if (updated) {
      newParams.set('page', '1'); // 페이지 1로 리셋
      setSearchParams(newParams);
      setIsProfileMode(true); // 버튼 ON 상태로 변경
    } else {
      alert("프로필에 설정된 정보가 없거나 매칭되는 필터가 없습니다.");
    }
  };

  // 프로필 필터 해제
  const clearProfileFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    // 피부 관련 필터만 싹 지우기
    newParams.delete('skinType');
    newParams.delete('skinConcern');
    newParams.delete('personalColor');
    
    setSearchParams(newParams);
    setIsProfileMode(false); // 버튼 OFF 상태로 변경
  };

  // 토글 핸들러
  const handleProfileToggle = () => {
    if (isProfileMode) {
      clearProfileFilters();
    } else {
      if (userProfile) {
        applyProfileFilters(userProfile);
      } else {
        alert("피부 프로필 정보를 불러올 수 없습니다. 마이페이지에서 설정해주세요.");
      }
    }
  };

  // ------------------------------------------------------
  // 상품 목록 조회 (URL 파라미터 변경 감지)
  // ------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setIsLoading(true); 

      try {
        const queryString = searchParams.toString();
        const response = await fetch(`http://localhost:8080/api/products?${queryString}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();

        setProducts(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) { 
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts(); 

    return () => {
      controller.abort();
    };
  }, [searchParams]); 

  // 필터 UI 포커스 제어
  useEffect(() => {
    if (isFilterOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100); 
    }
  }, [isFilterOpen]);

  // ------------------------------------------------------
  // 이벤트 핸들러 (검색, 정렬, 필터 변경 시 '내 맞춤' 해제)
  // ------------------------------------------------------

  // URL 파라미터 업데이트 공통 함수
  const updateSearchParams = (newParams, resetPage = true) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(newParams)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.set('page', '1');
    
    setSearchParams(params);
    setIsProfileMode(false); // [중요] 수동 조작 시 토글 버튼 OFF
  };

  // 사이드바 필터 변경 핸들러
  const handleFilterChange = (category, value) => {
    const currentValues = searchParams.getAll(category);
    let newValues;

    if (currentValues.includes(value)) {
      newValues = currentValues.filter(item => item !== value);
    } else {
      newValues = [...currentValues, value];
    }

    const params = new URLSearchParams(searchParams);
    params.delete(category);
    newValues.forEach(val => params.append(category, val));
    params.set('page', '1');
    
    setSearchParams(params);
    setIsProfileMode(false); // [중요] 수동 조작 시 토글 버튼 OFF
  };

  const handleSearchChange = (e) => {
    updateSearchParams({ q: e.target.value });
  };

  const handleSortChange = (e) => {
    updateSearchParams({ sort: e.target.value });
  };

  const handlePageChange = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    setSearchParams(params);
  };

  // 장바구니 담기
  const handleAddToCart = async (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const member = getStoredMember();
    if (!member || !member.memNo) {
        alert('회원 정보를 찾을 수 없습니다.');
        return;
    }

    if (!product.defaultOptionNo) {
        alert('옵션을 선택해야 하는 상품입니다. 상세 페이지에서 담아주세요.');
        navigate(`/products/${product.prdNo}`);
        return;
    }

    try {
        const response = await fetchWithAuth('/coco/members/cart/items', {
            method: 'POST',
            body: JSON.stringify({
                memNo: member.memNo,
                optionNo: product.defaultOptionNo,
                cartQty: 1
            })
        });

        if (response.ok) {
             if(window.confirm(`${product.prdName}을(를) 장바구니에 담았습니다.\n장바구니로 이동하시겠습니까?`)) {
                 navigate('/cart');
             }
        } else {
            const errorData = await response.json();
            alert(errorData.message || '장바구니 담기에 실패했습니다.');
        }
    } catch (error) {
        console.error(error);
        alert('오류가 발생했습니다.');
    }
  };

  return (
    <PageContainer>
      <ProductSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        closeButtonRef={closeButtonRef}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        isLoggedIn={isLoggedIn()}
        isProfileMode={isProfileMode}
        onProfileToggle={handleProfileToggle}
      />

      {/* --- 메인 상품 목록 --- */}
      <MainContent>
        <ProductListHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalElements={totalElements}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onFilterToggle={() => setIsFilterOpen(true)}
        />

        {/* --- 로딩 / 비어있음 / 데이터 있음 분기 --- */}
        {isLoading ? (
          <ProductListSkeleton />
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
            <h3>검색 결과가 없습니다</h3>
            <p>필터 조건을 다시 확인해 주세요.</p>
          </div>
        ) : (
          <>
            <ProductListGrid>
              {products.map((product) => (
                <ProductCard
                  key={product.prdNo}
                  product={product}
                  onAddToCart={(e) => handleAddToCart(e, product)}
                />
              ))}
            </ProductListGrid>

            {/* 페이지네이션 컴포넌트 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </MainContent>
    </PageContainer>
  );
}

export default ProductListPage;
